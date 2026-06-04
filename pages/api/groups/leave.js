// pages/api/groups/leave.js
import { getDb }       from '../../../lib/db';
import { requireAuth } from '../../../lib/session';

export default async function handler(req, res) {
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
