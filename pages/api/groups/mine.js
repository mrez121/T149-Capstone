// pages/api/groups/mine.js
import { findSharedSlots } from '../../../lib/constraints';
import { getDb }       from '../../../lib/db';
import { requireAuth } from '../../../lib/session';

/**
 * @function handler
 * @async
 * This function handles HTTP requests for the current user's group information
 * GET - gets the current user's group information
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and a json object
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  // Authentication check
  const student = requireAuth(req, res);
  if (!student) return;

  const db = getDb();
  // Find the correct group
  const [grpRows] = await db.query(`
    SELECT g.* FROM \`groups\` g
    JOIN group_members gm ON g.group_id = gm.group_id
    WHERE gm.student_id = ?
  `, [student.studentId]);
  // Find other group members
  let members = [];
  if (grpRows.length > 0) {
    const [memberRows] = await db.query(`
      SELECT s.student_id, s.teamup_id, s.name, s.is_new, s.cohort
      FROM students s
      JOIN group_members gm ON s.student_id = gm.student_id
      WHERE gm.group_id = ?
    `, [grpRows[0].group_id]);
    members = memberRows;
    // Revalidate group shared timeslot on load in case availability or unit timeslots change.
    const shared = await findSharedSlots(members.map(m => m.student_id));
    await db.query(
      'UPDATE `groups` SET shared_slot = ? WHERE group_id = ?',
      [shared.size > 0 ? [...shared].sort()[0] : null, grpRows[0].group_id]
    );
  }
  // Find the unit constraints for the group
  const [unit] = await db.query(`
    SELECT unit_id FROM unit_enrolments WHERE student_id = ?`, student.studentId
  );
  const [unitConstraints] = await db.query(`
    SELECT * FROM unit_constraints WHERE unit_id = ?`, unit[0].unit_id
  );
  // Find the availability of the student
  const [slotRows] = await db.query(
    'SELECT slot FROM availability WHERE student_id = ? ORDER BY slot',
    [student.studentId]
  );

  // Pending invites for this student
  const [inviteRows] = await db.query(`
    SELECT i.*, g.name AS group_name, s.name AS from_name
    FROM invites i
    JOIN \`groups\` g ON g.group_id = i.group_id
    JOIN students s  ON s.student_id = i.from_student_id
    WHERE i.to_student_id = ? AND i.status = 'pending'
  `, [student.studentId]);

  return res.status(200).json({
    group:   grpRows[0] || null,
    members,
    groupConstraints: unitConstraints[0] || null,
    slots:   slotRows.map(r => r.slot),
    student,
    invites: inviteRows,
  });
}
