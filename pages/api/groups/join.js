// pages/api/groups/join.js
import { getDb }       from '../../../lib/db';
import { requireAuth } from '../../../lib/session';
import { findSharedSlots, getGroupMembers, validateJoin } from '../../../lib/constraints';

/**
 * @function handler
 * @async
 * This function handles HTTP requests for joinging a public group
 * POST - user joins a public group
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and a json object
 */
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

  // Group exists, is public, and not locked?
  const [grpRows] = await db.query(
    'SELECT * FROM `groups` WHERE group_id = ?', [groupId]
  );
  if (!grpRows.length) return res.status(404).json({ error: 'Group not found.' });
  if (grpRows[0].status === 'locked') {
    return res.status(400).json({ error: 'This group is locked.' });
  }
  if (grpRows[0].type !== 'public') {
    return res.status(403).json({ error: 'Private groups are invite-only.' });
  }
  // Confirm that the student joining the group won't break the group's constraints
  const { ok, errors } = await validateJoin(groupId, student.studentId);
  if (!ok) return res.status(400).json({ ok: false, errors });

  // Add the student to the group
  await db.query(
    'INSERT INTO group_members (group_id, student_id) VALUES (?, ?)',
    [groupId, student.studentId]
  );
  // Update the group's shared timeslot.
  const updatedMembers = await getGroupMembers(groupId);
  const shared = await findSharedSlots(updatedMembers.map(m => m.student_id));
  await db.query(
    'UPDATE `groups` SET shared_slot = ? WHERE group_id = ?',
    [shared.size > 0 ? [...shared].sort()[0] : null, groupId]
  );

  return res.status(200).json({ ok: true });
}
