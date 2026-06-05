// pages/api/groups/respond-invite.js
import { getDb }       from '../../../lib/db';
import { requireAuth } from '../../../lib/session';
import { findSharedSlots, getGroupMembers, validateJoin } from '../../../lib/constraints';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const student = requireAuth(req, res);
  if (!student) return;

  const { inviteId, action } = req.body;
  const db = getDb();

  const [invRows] = await db.query(
    'SELECT * FROM invites WHERE id = ? AND to_student_id = ? AND status = "pending"',
    [inviteId, student.studentId]
  );
  if (!invRows.length) return res.status(404).json({ error: 'Invite not found.' });

  if (action === 'decline') {
    await db.query('UPDATE invites SET status = "declined" WHERE id = ?', [inviteId]);
    return res.status(200).json({ ok: true });
  }

  if (action === 'accept') {
    const groupId = invRows[0].group_id;

    const [existing] = await db.query(
      'SELECT group_id FROM group_members WHERE student_id = ?',
      [student.studentId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You are already in a group.' });
    }

    const { ok, errors } = await validateJoin(groupId, student.studentId);
    if (!ok) return res.status(400).json({ ok: false, errors });

    await db.query(
      'INSERT INTO group_members (group_id, student_id) VALUES (?, ?)',
      [groupId, student.studentId]
    );

    const updatedMembers = await getGroupMembers(groupId);
    const shared = await findSharedSlots(updatedMembers.map(m => m.student_id));
    await db.query(
      'UPDATE `groups` SET shared_slot = ? WHERE group_id = ?',
      [shared.size > 0 ? [...shared].sort()[0] : null, groupId]
    );

    await db.query('UPDATE invites SET status = "accepted" WHERE id = ?', [inviteId]);
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Invalid action.' });
}
