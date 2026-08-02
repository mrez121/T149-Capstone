// pages/api/auth/login.js
import bcrypt                          from 'bcryptjs';
import { getDb }                       from '../../../lib/db';
import { createToken, setTokenCookie } from '../../../lib/session';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, password } = req.body;
  if (!userId || !password) {
    return res.status(400).json({ error: 'Student ID and password are required.' });
  }

  //DB queries to check against student and teaching team tables
  const db = getDb();
  const uIDCheck = userId.trim().toLowerCase();
  const [studentCheck] = await db.query("SELECT * FROM students WHERE student_id = ?", uIDCheck);
  const [tutorCheck] = await db.query("SELECT * FROM teaching_team where tutor_id = ?", uIDCheck);

  if(studentCheck[0]) {
    const student = studentCheck[0];
    if(!bcrypt.compareSync(password, student.password)) {
      return res.status(401).json({error: "Invalid user ID or password."});
    }
    const payload = {
      userID: student.student_id,
      name:   student.name,
      email:  student.email,
      isNew:  student.is_new,
      cohort: student.cohort
    };
    const token = createToken(payload);
    setTokenCookie(res, token);
    return res.status(200).json({ok: true, student: payload});
  }
  else if(tutorCheck[0]) {
    const tutor = tutorCheck[0];
    if(!bcrypt.compareSync(password, tutor.password)) {
      return res.status(401).json({error: "Invalid user ID or password."});
    }
    const payload = {
      userId:   tutor.tutor_id,
      name:     tutor.name,
      email:    tutor.email,
      position: tutor.position
    };
    const token = createToken(payload);
    setTokenCookie(res, token);
    return res.status(200).json({ok: true, tutor: payload});
  }
  else{
    return res.status(401).json({error: "Invalid user ID or password."});
  }
}
