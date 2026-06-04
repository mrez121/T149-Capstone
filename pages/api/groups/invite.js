// pages/api/groups/invite.js
// Creator invites a student by their student ID.
// No invite codes — private groups are invite-only via student ID.

import { getDb }        from '../../../lib/db';
import { requireAuth }  from '../../../lib/session';
import { validateJoin } from '../../../lib/constraints';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const student = requireAuth(req, res);
  if (!student) return;

  const { targetStudentId, groupId } = req.body;

  if (!targetStudentId || !groupId) {
    return res.status(400).json({ error: 'targetStudentId and groupId are required.' });
  }

  const db = getDb();

  // Check requester is the group creator
  const [grpRows] = await db.query(
    'SELECT * FROM `groups` WHERE group_id = ? AND created_by = ?',
    [groupId, student.studentId]
  );
  if (!grpRows.length) {
    return res.status(403).json({ error: 'Only the group creator can send invites.' });
  }

  if (grpRows[0].status === 'locked') {
    return res.status(400).json({ error: 'Group is locked — cannot send new invites.' });
  }

  // Check target student exists
  const target = targetStudentId.trim().toLowerCase();
  const [targetRows] = await db.query(
    'SELECT * FROM students WHERE student_id = ?', [target]
  );
  if (!targetRows.length) {
    return res.status(404).json({ error: `Student "${target}" not found.` });
  }

  // Can't invite yourself
  if (target === student.studentId) {
    return res.status(400).json({ error: 'You cannot invite yourself.' });
  }

  // Check target not already in a group
  const [targetInGroup] = await db.query(
    'SELECT group_id FROM group_members WHERE student_id = ?', [target]
  );
  if (targetInGroup.length > 0) {
    return res.status(400).json({ error: `${targetRows[0].name} is already in a group.` });
  }

  // Pre-check constraints
  const { ok, errors } = await validateJoin(groupId, target);
  if (!ok) return res.status(400).json({ ok: false, errors });

  // Send invite (ignore duplicate)
  await db.query(
    'INSERT IGNORE INTO invites (group_id, from_student_id, to_student_id, status) VALUES (?, ?, ?, "pending")',
    [groupId, student.studentId, target]
  );

  return res.status(200).json({ ok: true, message: `Invite sent to ${targetRows[0].name}` });
}
