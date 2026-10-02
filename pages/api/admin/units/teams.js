// pages/api/admin/units/teams.js
// GET - teams in a unit
// POST - add team to unit
// DELETE - remove a team from unit

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

    // GET - filter and page teams in a unit
    if(req.method === 'GET') {
        const unit = req.query.unit;
        if(typeof unit !== 'string' || !/^[1-9]\d*$/.test(unit) || !Number.isSafeInteger(Number(unit))) {
            return res.status(400).json({error: 'A valid unit ID is required.'});
        }
        const {size = 'all', page = '1', pageSize = '25'} = req.body;
    }

    // POST - add a team to a unit
    if(req.method === 'POST') {
        const unit = req.query.unit;
        const unitCode = req.query.unitCode;
        const {team_id, name} = req.body;

        // Validate required fields
        if(!team_id || !name) {
            return res.status(400).json({error: 'Team ID and Team Name are required.'});
        }

        // Check unit exists
        const [unitCheck] = await db.query('SELECT * FROM units WHERE id = ? AND unit_code = ?', [unit, unitCode]);
        if(!unitCheck.length) {
            return res.status(404).json({error: 'Unit not found.'});
        }

        // Attempt to add team to unit - team id must be unique, so an error will be returned if it clashes
        await db.query(
            `INSERT INTO teams (team_id, name, unit_id, created_by) VALUES (?, ?, ?, ?)`,
            [team_id, name, unit, admin.studentId]
        );
        //NEED ERROR HANDLING HERE FOR DUPLICATE TEAM_IDS

        return res.status(200).json({ok: true});
    }

    if(req.method === 'DELETE') {
        // Delete a team
    }

    // Throw an error if incorrect method included in request
    return res.status(405).json({error: 'Failed to reach database'});
}