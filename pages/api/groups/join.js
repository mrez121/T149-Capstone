// pages/api/groups/join.js
import { getDb }       from '../../../lib/db';
import { requireAuth } from '../../../lib/session';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const student = requireAuth(req, res);
  if (!student) return;

  const { groupId } = req.body;
  const db = getDb();

  // Already in a group?
  const [existing] = await db.query(
    'SELECT group_id FROM group_members WHERE student_id = ?',
    [student.studentId]
  );
  if (existing.length > 0) {
    return res.status(400).json({ error: 'You are already in a group.' });
  }

  // Group exists and not locked?
  const [grpRows] = await db.query(
    'SELECT * FROM `groups` WHERE group_id = ?', [groupId]
  );
  if (!grpRows.length) return res.status(404).json({ error: 'Group not found.' });
  if (grpRows[0].status === 'locked') {
    return res.status(400).json({ error: 'This group is locked.' });
  }

  // Group full?
  const [countRows] = await db.query(
    'SELECT COUNT(*) as c FROM group_members WHERE group_id = ?', [groupId]
  );
  if (countRows[0].c >= 5) {
    return res.status(400).json({ error: 'Group is full — maximum 5 members.' });
  }

  // Add to group — no constraint check, constraints checked on lock
  await db.query(
    'INSERT INTO group_members (group_id, student_id) VALUES (?, ?)',
    [groupId, student.studentId]
  );

  return res.status(200).json({ ok: true });
}