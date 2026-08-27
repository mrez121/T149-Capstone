// pages/api/admin/units/groups.js
// GET - groups in a unit

import { getDb } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/session";

/**
 * @function handler
 * @async
 * This function handles HTTP requests for viewing and managing groups.
 * GET - view all groups in a specified unit.
 * POST - unlock a locked group, allowing students to leave or join the group again.
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and a json object
 */
export default async function handler(req, res) {
    /**
     * @const admin
     * @const getDb
     * @const unit
     * @const groups
     * @const grpRows
     */
    const admin = requireAuth(req, res);
    if(!admin || !admin.isAdmin) {
        return res.status(403).json({error: 'Admin access is required.'});
    }
    const db = getDb();

    // GET - list all groups in a unit
    if(req.method === 'GET') {
        //Grab unit id (e.g. 1) from url
        const unit = parseInt(req.query.unit);
        //Fetch group info from groups table if the group is in the specified unit
        const [groups] = await db.query(
            `SELECT g.group_id, g.name, g.status, g.created_by
            FROM \`groups\` g
            WHERE g.unit_id = ?`,
            unit
        );
        //Return success response and groups object
        return res.status(200).json({groups});
    }

    //POST - unlock a locked group
    if(req.method === 'POST') {
        //grab group id (e.g. G-57BAC1) from url
        const unit = req.query.groupId;
        const [grpRows] = await db.query(
            `SELECT * FROM \`groups\` WHERE group_id = ?`, unit
        );
        if(!grpRows.length) {
            return res.status(404).json({error: 'Group not found.'});
        }
        if(grpRows[0].status !== 'locked') {
            return res.status(400).json({error: `${grpRows[0].name} is already unlocked.`});
        }

        await db.query(
            `UPDATE \`groups\` SET status = 'forming' WHERE group_id = ?`, grpRows[0].group_id 
        );

        return res.status(200).json({ok: true});
    }

    //Throw an error if incorrect method included in request
    return res.status(405).json({error: 'Failed to reach database'});
}