// pages/api/groups/mine.js
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
  /**
   * @const student
   * @const db
   * @const grpRows
   * @var members
   * @const memberRows
   * @const slotRows
   * @const inviteRows
   */
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  const student = requireAuth(req, res);
  if (!student) return;

  const db = getDb();

  const [grpRows] = await db.query(`
    SELECT g.* FROM \`groups\` g
    JOIN group_members gm ON g.group_id = gm.group_id
    WHERE gm.student_id = ?
  `, [student.studentId]);

  let members = [];
  if (grpRows.length > 0) {
    const [memberRows] = await db.query(`
      SELECT s.student_id, s.teamup_id, s.name, s.is_new, s.cohort
      FROM students s
      JOIN group_members gm ON s.student_id = gm.student_id
      WHERE gm.group_id = ?
    `, [grpRows[0].group_id]);
    members = memberRows;
  }

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
    slots:   slotRows.map(r => r.slot),
    student,
    invites: inviteRows,
  });
}
