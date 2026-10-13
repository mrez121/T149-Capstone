// pages/api/groups/lock.js
import { getDb }               from '../../../lib/db';
import { requireAuth }         from '../../../lib/session';
import { validateGroupReady }  from '../../../lib/constraints';
import { sendGroupLockedEmail } from '../../../lib/email';

/**
 * @function handler
 * @async
 * This function handles HTTP requests for locking a group that meets all constraints
 * POST - lock a group, preventing students from leaving or joining it.
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and a json object
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  
  // Authentication check
  const student = requireAuth(req, res);
  if (!student) return;

  const { groupId } = req.body;
  const db = getDb();

  // Check that the group exists
  const [grpRows] = await db.query(
    'SELECT * FROM `groups` WHERE group_id = ?', [groupId]
  );
  if (!grpRows.length) return res.status(404).json({ error: 'Group not found.' });

  // Check that the user requesting to lock the group is the group creator
  if (grpRows[0].created_by !== student.studentId) {
    return res.status(403).json({ error: 'Only the group creator can lock the group.' });
  }

  // Validate the group against unit constraints using the validation engine
  const { ok, errors, sharedSlots } = await validateGroupReady(groupId);
  if (!ok) return res.status(400).json({ ok: false, errors });

  // If group is validated against constraints, lock the group
  await db.query(
    "UPDATE `groups` SET status = 'locked', shared_slot = ? WHERE group_id = ?",
    [sharedSlots.sort()[0], groupId]
  );

  // Get group members for the email
  const [members] = await db.query(`
    SELECT s.name FROM group_members gm
    JOIN students s ON s.student_id = gm.student_id
    WHERE gm.group_id = ?
  `, [groupId]);

  // Get the unit for this group
  const [unitRows] = await db.query(`
    SELECT u.unit_code, u.unit_name FROM units u
    JOIN \`groups\` g ON g.unit_id = u.unit_code
    WHERE g.group_id = ?
  `, [groupId]);
  const unit = unitRows[0] || { unit_code: 'Unknown', unit_name: 'Unknown' };

  // Get all admin emails to notify
  const [admins] = await db.query(
    'SELECT name, email FROM students WHERE is_admin = 1'
  );

  // Send email to each admin
  for (const admin of admins) {
    await sendGroupLockedEmail(
      admin.email,
      admin.name,
      grpRows[0].name,
      groupId,
      unit.unit_code,
      unit.unit_name,
      members.map(m => m.name),
      sharedSlots.sort()[0]
    );
  }

  return res.status(200).json({ ok: true, sharedSlot: sharedSlots.sort()[0] });
}