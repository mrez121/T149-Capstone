// pages/api/students/[id].js

import { useRouter } from "next/router";
import { getDb } from "../../../lib/db";
import { requireAuth } from "../../../lib/session";

/**
 * @function handler
 * @async
 * This function handles HTTP requests for editing student profile information.
 * It also handles editing of student availability.
 * @todo GET - get the timeslots for the unit the student is enrolled in.
 * @todo PUT - edit student profile and availability information for the specified user.
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and a json object
 */
export default async function handler(req, res) {
    
    const student = requireAuth(req, res);
    if(!student) {
        return;
    }

    const db = getDb();

    if(req.method === 'GET') {
        const [units] = await db.query(
            'SELECT unit_id FROM unit_enrolments WHERE student_id = ? ORDER BY id LIMIT 1',
            [student.studentId],
        );
        if (!units.length) {
            return res.status(400).json({ error: 'Student is not enrolled in a unit.' });
        }
        const unit = units[0].unit_id;
        const[timeslots] = await db.query(
            'SELECT slot FROM timeslots WHERE unit_id = ? ORDER BY id', unit
        );
        return res.status(200).json({timeslots})
    }

    if(req.method === 'PUT') {
        const submitType = req.body.submitType;
        console.log(submitType);
    }

    return res.status(500).json({error: 'Unable to load data. Please try again.'});
}