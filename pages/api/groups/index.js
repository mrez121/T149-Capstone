// pages/api/groups/index.js
import { getDb }        from '../../../lib/db';
import { requireAuth }  from '../../../lib/session';
import { v4 as uuidv4 } from 'uuid';

/**
 * @function handler
 * @async
 * This function handles the HTTP requests group related queries and functions
 * GET  - list public groups
 * POST - create a public or private group
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and a json object
 */
export default async function handler(req, res) {
  /**
   * @const student the user's JWT containing their user information
   * @const db the database system (currently specified in env.local)
   * @const studentUnit the user's unit based on which unit they're enrolled in from the database
   * @const groupUnitId the id value of the unit in the database (for Foreign Key dependency in groups table)
   * @const groups the list of available public groups that can be joined
   * @const existing value to check if the user is already in a group when they try to make a new group
   * @const type group type can be set to either public or private
   * @const groupId unique id for the group when a new group is created
   * @const countRows count of groups returned from DB (for group naming)
   * @const groupName name of newly created group
   */
  const student = requireAuth(req, res);
  if (!student) return;

  const db = getDb();
  
  // Get the current student's unit from the unit_enrolments table
  const [studentUnit] = await db.query(`
    SELECT unit_id FROM unit_enrolments WHERE student_id = ?`,
    [student.studentId]
  );

  // Get the current student's unit id from the units table (needed for Foreign Key dependency)
  const [groupUnitId] = await db.query(`
    SELECT id from units WHERE unit_code = ?`,
    [studentUnit[0].unit_id]
  );

  // GET — list public groups in the current user's unit
  if (req.method === 'GET') {
    const [groups] = await db.query(`
      SELECT g.*,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id) AS member_count,
        (SELECT COUNT(*) FROM group_members gm2
         JOIN students s2 ON s2.student_id = gm2.student_id
         WHERE gm2.group_id = g.group_id AND s2.is_new = 1) AS new_count
      FROM \`groups\` g
      WHERE g.type = 'public' AND g.status = 'forming' AND g.unit_id = ?
      ORDER BY g.created_at DESC`,
      [groupUnitId[0].id]
  );
    return res.status(200).json({ groups });
  }

  // POST — create group for the current user's unit (can be public or private)
  if (req.method === 'POST') {
    const [existing] = await db.query(
      'SELECT group_id FROM group_members WHERE student_id = ?',
      [student.studentId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You are already in a group.' });
    }

    const { type = 'public' } = req.body;
    const groupId = `G-${uuidv4().slice(0, 6).toUpperCase()}`;

    // Auto-name: Group 1, Group 2, etc.
    const [countRows] = await db.query('SELECT COUNT(*) as c FROM `groups`');
    const groupName   = `Group ${countRows[0].c + 1}`;

    const createGroupResult = await db.query(
      "INSERT INTO `groups` (group_id, name, type, status, created_by, unit_id) VALUES (?, ?, ?, 'forming', ?, ?)",
      [groupId, groupName, type, student.studentId, groupUnitId[0].id]
    );
    await db.query(
      'INSERT INTO group_members (group_id, student_id) VALUES (?, ?)',
      [groupId, student.studentId]
    );

    return res.status(201).json({ ok: true, groupId, name: groupName });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}
