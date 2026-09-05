// pages/api/auth/login.js
import bcrypt                          from 'bcryptjs';
import { getDb }                       from '../../../lib/db';
import { createToken, setTokenCookie } from '../../../lib/session';

/**
 * @function handler
 * @async
 * This function handles HTTP requests to the login page
 * POST - sends the provided studentId and password for querying against the database
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and a json object
 */
export default async function handler(req, res) {
  /**
   * @const studentId
   * @const password
   * @const db
   * @const rows
   * @const student
   * @const payload
   * @const token
   */
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { studentId, password } = req.body;
  if (!studentId || !password) {
    return res.status(400).json({ error: 'Student ID and password are required.' });
  }

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
    teamupId:  student.teamup_id,
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
