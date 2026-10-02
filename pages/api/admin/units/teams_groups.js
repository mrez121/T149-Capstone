// pages/api/admin/units/teams_groups.js
// GET - get locked groups in a unit that can be assigned to a team
// POST - add a group to a team
// DELETE - remove a group from a team

import { getDb } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/session";

export default async function handler(req, res) {
    const admin = requireAuth(req, res);
    if(!admin) {
        return;
    }
    if(!admin.isAdmin) {
        return res.status(403).json({error: 'Admin access is required.'});
    }

    const db = getDb();

    // GET - retrieve locked groups in unit that can be assigned to a team and unit constraints
    if(req.method === 'GET') {
        const unitId = req.query.unit;
        const [groups] = await db.query(
            `SELECT g.*,
            FROM \`groups\` g
            LEFT JOIN team_groups tg ON g.group_id = tg.group_id
            WHERE tg.group_id IS NULL AND g.status = 'locked' AND g.unit_id = ?
            ORDER BY g.created_at DESC          
            `, [unitId]
        );
        const [constraints] = await db.query(
            `SELECT * FROM unit_constraints WHERE unit_id = ?`, [unitId]
        );
        return res.status(200).json({groups, constraints});
    }

    // POST - add groups to a team
    if(req.method === 'POST') {

    }

    // DELETE - remove groups from a team
    if(req.method === 'DELETE') {

    }

    // Throw an error if incorrect method included in request
    return res.status(405).json({error: 'Failed to reach database'});
}