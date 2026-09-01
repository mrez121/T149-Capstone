// pages/api/admin/units/enrolments_students.js
import { getDb } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/session";

/**
 * @function handler
 * @async
 * This function handles HTTP requests related to unit enrolments
 * GET      - gets the students enrolled in a unit
 * POST      - adds a student to the unit
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
     * @const unit
     * @const enrolments
     * @const student_id
     * @const name
     * @const email
     * @const unitCheck
     * @const studentCheck
     * @const enrolmentCheck
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
    // POST - add a student to a unit
    if(req.method === 'POST') {
        // Grab unit_id (e.g. IFB399) from url
        const unit = req.query.unit;
        // Grab student details from submitted form
        const {student_id, name, email} = req.body;

        // Validate required fields
        if(!student_id || !name || !email) {
            return res.status(400).json({error: 'Student ID, name, and email address are required.'});
        }

        //Check unit exists
        const [unitCheck] = await db.query('SELECT * FROM units WHERE unit_code = ?', unit);
        if(!unitCheck.length) return res.status(404).json({error: 'Unit not found.'});

        //Check student exists
        const [studentCheck] = await db.query(
            `SELECT s.student_id, s.name, s.email, s.is_admin
            FROM students s
            WHERE student_id = ? AND name = ? AND email = ?`, 
            [student_id, name, email]
        );
        if(!studentCheck.length) return res.status(404).json({error: 'Student not found.'});
        if(studentCheck[0].is_admin === 1) return res.status(403).json({error: 'Cannot enrol admin user.'});

        //Check that the student isn't already enrolled in a unit
        const [enrolmentCheck] = await db.query(
            `SELECT unit_id, student_id
            FROM unit_enrolments
            WHERE student_id = ?`,
            [student_id]
        );
        if(enrolmentCheck.length) {
            return res.status(400).json({error: `Student ${student_id} is already enrolled in a unit`});
        }

        //Insert the student into unit_enrolment table
        await db.query(
            `INSERT INTO unit_enrolments (unit_id, student_id) VALUES (?, ?)`,
            [unit, student_id]
        );

        return res.status(200).json({ok: true});
    }

    // DELETE - remove a student from a unit
    if(req.method === 'DELETE') {
        // Grab unit_id (e.g. IFB399) from url
        const unit = req.query.unit;
        //Grab student details from submitted form
        const {student_id, name, email} = req.body;

        // Check unit exists and that the student is enrolled in the unit
        const [unitCheck] = await db.query('SELECT * FROM units WHERE unit_code = ?', unit);
        if(!unitCheck.length) return res.status(404).json({error: 'Student not enrolled in unit.'});

        // Check student exists
        const [studentCheck] = await db.query(
            `SELECT s.student_id, s.name, s.email
            FROM students s
            WHERE student_id = ? AND name = ? AND email = ?`,
            [student_id, name, email]
        );
        if(!studentCheck.length) return res.status(404).json({error: 'Student not found.'});

        //If student is in a group, check that the group is locked, unlock if needed,
        //remove the student from the group and transfer ownership of the group to the next student if needed.
        //Delete the group if the student is the only group member in the group.
        const [groupCheck] = await db.query(
            `SELECT group_id FROM group_members WHERE student_id = ?`, [student_id]
        );
        if(groupCheck.length) {
            const [groupDetail] = await db.query(
                `SELECT * FROM \`groups\` WHERE group_id = ?`, [groupCheck[0].group_id]
            );
            console.log(groupDetail);
            if(groupDetail[0].status === 'locked') {
                await db.query(`UPDATE \`groups\` SET status = ? WHERE group_id = ?`, ["forming", groupDetail[0].group_id]);
            }
            if(groupDetail[0].created_by === student_id) {
                console.log('DEBUGGING: created_by check was true');
                const[groupMembers] = await db.query(
                    `SELECT student_id
                    FROM group_members
                    WHERE group_id = ?
                    ORDER BY joined_at`,
                    groupCheck[0].group_id
                );
                console.log(groupMembers);
                console.log(groupMembers.length === 1);
                console.log(groupMembers.length > 1);
                if(groupMembers.length === 1) {
                    console.log("DEBUGGING: groupMembers.length === 1 check passed");
                    await db.query(
                        `DELETE FROM group_members WHERE group_id = ? AND student_id = ?`, [groupDetail[0].group_id, student_id]
                    );
                    await db.query(
                        `DELETE FROM \`groups\` WHERE group_id = ?`, [groupDetail[0].group_id]
                    );
                }
                if(groupMembers.length > 1) {
                    const updateResult = await db.query(
                        `UPDATE \`groups\` SET created_by = ? WHERE group_id = ?`, [groupDetail[0].group_id, groupMembers[1]]
                    );
                    console.log(updateResult);
                    await db.query(
                        `DELETE FROM group_members WHERE group_id = ? AND student_id = ?`, [groupDetail[0].group_id, student_id]
                    );
                }
            }
        }

        // Delete student from unit_enrolments table
        await db.query(
            `DELETE FROM unit_enrolments WHERE unit_id = ? AND student_id = ? LIMIT 1`,
            [unit, student_id]
        );
        return res.status(200).json({ok: true});
    }

    //Throw an error if incorrect method included in request.
    return res.status(405).json({error: 'Failed to reach database'});
}