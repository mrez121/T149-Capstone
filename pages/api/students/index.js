// pages/api/students/index.js
import { getDb } from '../../../lib/db';
import { requireAuth } from '../../../lib/session';

// Read-only endpoint for the Student Directory page.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const student = requireAuth(req, res);
  if (!student) return;

  const db = getDb();

  // Return only public profile fields; password hashes and other private data
  // must never be exposed to the directory UI.
  const [studentRows] = await db.query(`
    SELECT student_id, name, email, is_new, cohort
    FROM students
    ORDER BY name ASC
  `);

  // Availability and group membership are loaded separately, then merged below.
  // This keeps the SQL simple and gives the client one clean object per student.
  const [slotRows] = await db.query(`
    SELECT student_id, slot
    FROM availability
    ORDER BY slot ASC
  `);

  const [groupRows] = await db.query(`
    SELECT gm.student_id, g.group_id, g.name, g.type, g.status
    FROM group_members gm
    JOIN \`groups\` g ON g.group_id = gm.group_id
  `);

  // Index availability by student ID so multiple slots can be attached to each profile.
  const slotsByStudent = new Map();
  for (const row of slotRows) {
    const slots = slotsByStudent.get(row.student_id) || [];
    slots.push(row.slot);
    slotsByStudent.set(row.student_id, slots);
  }

  // Each student can only belong to one active group in this prototype.
  const groupsByStudent = new Map(
    groupRows.map((row) => [row.student_id, row])
  );

  // Shape the database rows into the normalized response used by the directory cards.
  const students = studentRows.map((row) => {
    const group = groupsByStudent.get(row.student_id);

    return {
      studentId: row.student_id,
      name: row.name,
      email: row.email,
      isNew: Boolean(row.is_new),
      cohort: row.cohort,
      slots: slotsByStudent.get(row.student_id) || [],
      group: group
        ? {
            groupId: group.group_id,
            name: group.name,
            type: group.type,
            status: group.status,
          }
        : null,
    };
  });

  // Include the authenticated student so the client can label the current user.
  return res.status(200).json({
    student,
    students,
  });
}
