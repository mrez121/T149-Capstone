// pages/api/auth/login.js
import bcrypt                          from 'bcryptjs';
import { getDb }                       from '../../../lib/db';
import { createToken, setTokenCookie } from '../../../lib/session';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { studentId, password } = req.body;
  if (!studentId || !password) {
    return res.status(400).json({ error: 'Student ID and password are required.' });
  }

  /*Need to figure out how to query both tables and determine if the user is a student or tutor
  without breaking functionality. Previous commits (before reverts) broke data flow somewhere here.*/
  const db = getDb();
  const [rows] = await db.query(
    'SELECT * FROM students WHERE student_id = ?',
    [studentId.trim().toLowerCase()]
  );

  const student = rows[0];
  if (!student || !bcrypt.compareSync(password, student.password)) {
    return res.status(401).json({ error: 'Invalid student ID or password.' });
  }

  const payload = {
    studentId: student.student_id,
    name:      student.name,
    email:     student.email,
    isNew:     student.is_new,
    cohort:    student.cohort,
    isAdmin:   student.is_admin,
  };

  const token = createToken(payload);
  setTokenCookie(res, token);

  return res.status(200).json({ ok: true, student: payload });
}
