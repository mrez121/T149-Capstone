// pages/api/groups/respond-invite.js
import { getDb }       from '../../../lib/db';
import { requireAuth } from '../../../lib/session';

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
    // Check not already in a group
    const [existing] = await db.query(
      'SELECT group_id FROM group_members WHERE student_id = ?',
      [student.studentId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You are already in a group.' });
    }

    // Check group not locked and not full
    const [grpRows] = await db.query(
      'SELECT * FROM `groups` WHERE group_id = ?', [invRows[0].group_id]
    );
    if (grpRows[0].status === 'locked') {
      return res.status(400).json({ error: 'This group is now locked.' });
    }
    const [countRows] = await db.query(
      'SELECT COUNT(*) as c FROM group_members WHERE group_id = ?',
      [invRows[0].group_id]
    );
    if (countRows[0].c >= 5) {
      return res.status(400).json({ error: 'Group is full — maximum 5 members.' });
    }

    // Add to group — no constraint check, constraints only matter on lock
    await db.query(
      'INSERT INTO group_members (group_id, student_id) VALUES (?, ?)',
      [invRows[0].group_id, student.studentId]
    );
    // Recalculate shared slot after member joins
    const { findSharedSlots, getGroupMembers } = await import('../../../lib/constraints.js');
    const updatedMembers = await getGroupMembers(invRows[0].group_id);
    const memberIds = updatedMembers.map(m => m.student_id);
    const shared = await findSharedSlots(memberIds);
    if (shared.size > 0) {
      await db.query(
        'UPDATE `groups` SET shared_slot = ? WHERE group_id = ?',
        [[...shared].sort()[0], invRows[0].group_id]
      );
    }
    await db.query('UPDATE invites SET status = "accepted" WHERE id = ?', [inviteId]);
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Invalid action.' });
}