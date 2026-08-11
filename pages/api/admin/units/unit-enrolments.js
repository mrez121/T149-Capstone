// pages/api/admin/units/unit-enrolments.js
import { getDb } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/session";

export default async function handler(req, res) {
    const admin = requireAuth(req, res);
    if(!admin) {
        return;
    }

    const db = getDb();

    // GET - list students enrolled in a unit
    if(req.method === 'GET') {
        const unit = req.query.unit;
        const [enrolments] = await db.query(
            'SELECT student_id FROM unit_enrolments WHERE unit_id = ?', unit
        );
        const [students] = await db.query(
            `SELECT name, email, is_new, cohort FROM students WHERE student_id = ?`,
        );
        return res.status(201).json({unit, enrolments, students});
    }

    return res.status(405).json({error: 'failed to reach database'});
}