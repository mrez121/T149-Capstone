// pages/api/groups/leave.js
import { getDb }       from '../../../lib/db';
import { requireAuth } from '../../../lib/session';

/**
 * @function handler
 * @async
 * This function handles HTTP requests for leaving groups.
 * POST - remove the current user from the group they are currently in.
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and a json object
 */
export default async function handler(req, res) {
  /**
   * @const student
   * @const groupId
   * @const db
   * @const c
   */
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const student = requireAuth(req, res);
  if (!student) return;

  const { groupId } = req.body;
  const db = getDb();

  await db.query(
    'DELETE FROM group_members WHERE group_id = ? AND student_id = ?',
    [groupId, student.studentId]
  );

  const [[{ c }]] = await db.query(
    'SELECT COUNT(*) as c FROM group_members WHERE group_id = ?', [groupId]
  );
  if (c === 0) {
    await db.query('DELETE FROM `groups` WHERE group_id = ?', [groupId]);
  }

  return res.status(200).json({ ok: true });
}
