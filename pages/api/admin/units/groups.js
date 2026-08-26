// pages/api/admin/units/groups.js
// GET - groups in a unit

import { getDb } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/session";

export default async function handler(req, res) {

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
        return res.status(201).json({groups});
    }


    //Throw an error if incorrect method included in request
    return res.status(405).json({error: 'Failed to reach database'});
}