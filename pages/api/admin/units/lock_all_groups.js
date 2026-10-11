// pages/api/admin/units/lock_all_groups.js
// POST - lock all groups in a unit

import { getDb } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/session";
import { v4 as uuidv4 } from 'uuid';

/**
 * @function handler
 * @async
 * This function handles the HTTP requests for locking all groups as an administrator
 * POST - lock all groups. Any students in a unit that are not in a group are added to their own group and locked.
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and a json object
 */
export default async function handler(req, res) {
    const admin = requireAuth(req, res);
    if(!admin) {
        return;
    }
    if(!admin.isAdmin) {
        return res.status(403).json({error: 'Admin access is required.'});
    }

    const db = getDb();

    if(req.method === 'POST') {
        const unit = req.query.unit;
        const unitCode = req.query.unitCode;

        // Check unit exists
        const [unitExists] = await db.query(
            `SELECT * FROM units WHERE id = ? AND unit_code = ?`,
            [unit, unitCode]
        );
        if(!unitExists) {
            return res.status(404).json({error: 'Unit not found.'});
        }

        // Check for any students in the unit that are not in a group
        const [studentsNotInGroup] = await db.query(
            `SELECT student_id FROM unit_enrolments WHERE unit_id = ? AND student_id
            NOT IN (SELECT student_id FROM group_members)`,
            [unit]
        );

        // If there are students not in a group, add them to a group on their own.
        if(studentsNotInGroup) {
            const [groupCount] = await db.query('SELECT COUNT(*) as c FROM \`groups\` WHERE unit_id = ?', [unit]);
            let counter = groupCount[0].c + 1;

            for(const student of studentsNotInGroup) {
                const groupId = `G-${uuidv4().slice(0, 6).toUpperCase()}`;
                const groupName = `Group ${counter}`;
                
                const createGroupResult = await db.query(
                    `INSERT INTO \`groups\` (group_id, name, type, status, created_by, unit_id)
                    VALUES (?, ?, 'public', 'locked', ?, ?)`,
                    [groupId, groupName, student.student_id, unit]
                );
                if(!createGroupResult) {
                    return res.status(500).json({error: 'Unable to lock all groups. Encountered a problem with the server.'});
                }

                const studentGroupInsert = await db.query(
                    'INSERT INTO group_members (group_id, student_id) VALUES (?, ?)',
                    [groupId, student.student_id]
                );
                if(!studentGroupInsert) {
                    return res.status(500).json({error: 'Unable to lock all groups. Encountered a problem with the server.'});
                }
                counter++;
            }
        }

        // Lock all groups in the unit
        const lockGroups = await db.query(
            `UPDATE \`groups\` SET status = 'locked' WHERE unit_id = ?`, unit
        );
        if(!lockGroups) {
            return res.status(500).json({error: 'Unable to lock all groups. Encountered a problem with the server.'});
        }

        return res.status(200).json({ok: true});
    }

    // Throw an error if incorrect method included in request.
    return res.status(405).json({error: 'Failed to reach database'});
}