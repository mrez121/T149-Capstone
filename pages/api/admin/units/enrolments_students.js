// pages/api/admin/units/enrolments_students.js
// GET - students enrolled in a unit
import { getDb } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/session";

/**
 * @function handler
 * @async
 * This function handles HTTP requests related to unit enrolments
 * GET      - gets the students enrolled in a unit
 * @todo PUT      - adds a student to the unit
 * @todo DELETE   - removes a student from the unit
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and json object.
 */
export default async function handler(req, res) {
    //Check user is logged in as admin
    /**
     * @const admin
     * @const db
     */
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
    // PUT - add a student to a unit
    if(req.method === 'PUT') {
        // Grab unit_id (e.g. IFB399) from url
        const unit = req.query.unit;
    }
    //Throw an error if incorrect method included in request.
    return res.status(405).json({error: 'Failed to reach database'});
}