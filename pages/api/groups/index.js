// pages/api/groups/index.js
import { getDb }        from '../../../lib/db';
import { requireAuth }  from '../../../lib/session';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  const student = requireAuth(req, res);
  if (!student) return;

  const db = getDb();

  // GET — list public groups
  if (req.method === 'GET') {
    const [groups] = await db.query(`
      SELECT g.*,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id) AS member_count,
        (SELECT COUNT(*) FROM group_members gm2
         JOIN students s2 ON s2.student_id = gm2.student_id
         WHERE gm2.group_id = g.group_id AND s2.is_new = 1) AS new_count
      FROM \`groups\` g
      WHERE g.type = 'public' AND g.status = 'forming'
      ORDER BY g.created_at DESC
    `);
    return res.status(200).json({ groups });
  }

  // POST — create group
  if (req.method === 'POST') {
    const [existing] = await db.query(
      'SELECT group_id FROM group_members WHERE student_id = ?',
      [student.studentId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You are already in a group.' });
    }

    const { type = 'public' } = req.body;
    const groupId = `G-${uuidv4().slice(0, 6).toUpperCase()}`;

    // Auto-name: Group 1, Group 2, etc.
    const [countRows] = await db.query('SELECT COUNT(*) as c FROM `groups`');
    const groupName   = `Group ${countRows[0].c + 1}`;

    await db.query(
      "INSERT INTO `groups` (group_id, name, type, status, created_by) VALUES (?, ?, ?, 'forming', ?)",
      [groupId, groupName, type, student.studentId]
    );
    await db.query(
      'INSERT INTO group_members (group_id, student_id) VALUES (?, ?)',
      [groupId, student.studentId]
    );

    return res.status(201).json({ ok: true, groupId, name: groupName });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}
