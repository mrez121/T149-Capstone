// pages/api/admin/units/unit-enrolments.js
// GET - students enrolled in a unit
import { getDb } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/session";

export default async function handler(req, res) {
    //Check user is logged in as admin
    const admin = requireAuth(req, res);
    if(!admin || !admin.isAdmin) {
        return res.status(403).json({error: "Admin access is required."});
    }

    const db = getDb();

    // GET - list students enrolled in a unit
    if(req.method === 'GET') {
        //Grab unit_id (e.g. IFB399) from url
        const unit = req.query.unit;
        //Fetch student info from students table and enrolments info from unit_enrolments table if student is in the specified unit
        const [enrolments] = await db.query(
            `SELECT s.student_id, s.name, s.email, s.is_new, s.cohort
            FROM students s
            JOIN unit_enrolments ue ON ue.student_id = s.student_id and ue.unit_id = ?`, unit
        );
        //Return success response and enrolments object
        return res.status(201).json({enrolments});
    }
    //Throw an error if incorrect method included in request.
    return res.status(405).json({error: 'Failed to reach database'});
}