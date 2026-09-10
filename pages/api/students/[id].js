// pages/api/students/[id].js

import { getDb } from "../../../lib/db";
import { requireAuth } from "../../../lib/session";

/**
 * @function handler
 * @async
 * This function handles HTTP requests for editing student profile information.
 * It also handles editing of student availability.
 * GET - get the timeslots for the unit the student is enrolled in.
 * PUT - edit student profile and availability information for the specified user.
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and a json object
 */
export default async function handler(req, res) {
    // Check that the user is an authenticated student
    const student = requireAuth(req, res);
    if(!student) {
        return;
    }
    const db = getDb();
    // Fetch the timeslots of the unit that the student is enrolled in.
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
            'SELECT id, slot FROM timeslots WHERE unit_id = ? ORDER BY id', unit
        );
        return res.status(200).json({timeslots})
    }

    // update student profile or availability depending on form submitted
    if(req.method === 'PUT') {

        const submitType = req.body.submitType;

        if(submitType === 'profile') {
            const {preferred_name, remote_student, skills, interests, bio, contact_method, contact_handle} = req.body;
            
            const [studentExists] = await db.query('SELECT * FROM students WHERE student_id = ?', [student.studentId]);
            if(!studentExists.length) {
                return res.status(404).json({error: 'Student not found.'});
            }

            const update = await db.query(
                `UPDATE student_profiles SET
                preferred_name = ?,
                bio = ?,
                skills = ?,
                interests = ?,
                contact_method = ?,
                contact_handle = ?,
                remote_student = ?,
                updated_at = CURRENT_TIMESTAMP
                WHERE student_id = ?`,
                [preferred_name, bio, skills, interests, contact_method, contact_handle, remote_student, student.studentId]
            );

            if(!update) {
                return res.status(500).json({error: 'Failed to update availability - encountered a problem with the server.'});
            }
            return res.status(200).json({ok: true});
        }
        
        if(submitType === 'availability') {
            const {selectedSlots} = req.body;

            const [studentExists] = await db.query('SELECT * FROM students WHERE student_id = ?', [student.studentId]);
            if(!studentExists.length) {
                return res.status(404).json({error: 'Student not found.'});
            }

            await db.query(
                `DELETE FROM availability WHERE student_id = ?`,
                [student.studentId]
            );

            for(let i = 0; i < selectedSlots.length; i++) {
                let update = await db.query(
                    `INSERT INTO availability (student_id, slot) VALUES (?, ?)
                    ON DUPLICATE KEY UPDATE id=id`,
                    [student.studentId, selectedSlots[i]]
                );
                if(!update) {
                    return res.status(500).json({error: 'Failed to update availability - encountered a problem with the server.'});
                }
            }
            return res.status(200).json({ok: true});
        }
    }
    return res.status(500).json({error: 'Unable to load data. Please try again.'});
}