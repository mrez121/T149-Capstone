// pages/api/groups/invite.js
// Creator invites a student by their student ID.
// No invite codes — private groups are invite-only via student ID.

import { getDb }           from '../../../lib/db';
import { requireAuth }     from '../../../lib/session';
import { validateJoin }    from '../../../lib/constraints';
import { sendInviteEmail } from '../../../lib/email';

/**
 * This function handles the HTTP requests for creating group invite 
 * POST - create an invite for a student to a group
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and a json object
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  try {
    const student = requireAuth(req, res);
    if (!student) return;

    const { targetTeamUpId, groupId } = req.body || {};
    if (typeof targetTeamUpId !== 'string' || !targetTeamUpId.trim() || targetTeamUpId.length > 20 ||
        typeof groupId !== 'string' || !groupId.trim() || groupId.length > 20) {
      return res.status(400).json({ error: 'A valid TeamUp ID and group ID are required.' });
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
    const target = targetTeamUpId.trim().toLowerCase();
    const [targetRows] = await db.query(
      'SELECT * FROM students WHERE teamup_id = ?', [target]
    );
    if (!targetRows.length) {
      return res.status(404).json({ error: `Student "${target}" not found.` });
    }

    // Can't invite yourself
    if (targetRows[0].student_id === student.studentId) {
      return res.status(400).json({ error: 'You cannot invite yourself.' });
    }

    // Check target not already in a group
    const [targetInGroup] = await db.query(
      'SELECT group_id FROM group_members WHERE student_id = ?', [targetRows[0].student_id]
    );
    if (targetInGroup.length > 0) {
      return res.status(400).json({ error: `${targetRows[0].teamup_id} is already in a group.` });
    }

    // Pre-check constraints
    const { ok, errors } = await validateJoin(groupId, targetRows[0].student_id);
    if (!ok) return res.status(400).json({ ok: false, errors });

    const [existingInviteRows] = await db.query(
      'SELECT * FROM invites WHERE group_id = ? AND to_student_id = ?',
      [groupId, targetRows[0].student_id]
    );
    const existingInvite = existingInviteRows[0];
    if (existingInvite?.status === 'pending') {
      return res.status(400).json({ error: `An invite is already pending for ${targetRows[0].name}.` });
    }

    if (existingInvite) {
      await db.query(
        'UPDATE invites SET from_student_id = ?, status = "pending", created_at = CURRENT_TIMESTAMP WHERE id = ?',
        [student.studentId, existingInvite.id]
      );
    } else {
      await db.query(
        'INSERT INTO invites (group_id, from_student_id, to_student_id, status) VALUES (?, ?, ?, "pending")',
        [groupId, student.studentId, targetRows[0].student_id]
      );
    }

    // The invitation is already saved; optional email failure must not turn it into a failed invite.
    let emailSent = false;
    try {
      const email = await sendInviteEmail(
        targetRows[0].email,
        targetRows[0].name,
        student.name,
        grpRows[0].name
      );
      emailSent = Boolean(email?.ok);
    } catch (error) {
      console.error('Invite email notification failed:', error.code || error.name);
    }

    return res.status(200).json({
      ok: true,
      message: `Invite sent to ${targetRows[0].name}`,
      emailSent,
      ...(!emailSent && { warning: 'Invite saved, but the email notification could not be sent. Ask your classmate to check TeamUp.' }),
    });
  } catch (error) {
    console.error('Group invitation failed:', error.code || error.name);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Unable to send the invite. Please try again.' });
    }
  }
}
