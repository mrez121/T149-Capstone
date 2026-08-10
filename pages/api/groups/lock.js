// pages/api/groups/lock.js
import { getDb }               from '../../../lib/db';
import { requireAuth }         from '../../../lib/session';
import { validateGroupReady }  from '../../../lib/constraints';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });

  const student = requireAuth(req, res);
  if (!student) return;

  const { groupId } = req.body;
  const db = getDb();

  const [grpRows] = await db.query(
    'SELECT * FROM `groups` WHERE group_id = ?', [groupId]
  );
  if (!grpRows.length) return res.status(404).json({ error: 'Group not found.' });
  if (grpRows[0].created_by !== student.studentId) {
    return res.status(403).json({ error: 'Only the group creator can lock the group.' });
  }

  const { ok, errors, sharedSlots } = await validateGroupReady(groupId);
  if (!ok) return res.status(400).json({ ok: false, errors });

  await db.query(
    "UPDATE `groups` SET status = 'locked', shared_slot = ? WHERE group_id = ?",
    [sharedSlots.sort()[0], groupId]
  );

  return res.status(200).json({ ok: true, sharedSlot: sharedSlots.sort()[0] });
}
