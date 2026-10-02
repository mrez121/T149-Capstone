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
        if(['size', 'page', 'pageSize'].some(key => req.query[key] !== undefined && typeof req.query[key] !== 'string') ||
        !['all', '0', '1', '2', '3', '4', '5', '6+'].includes(size) || !/^[1-9]\d*$/.test(page) || !Number.isSafeInteger(Number(page)) ||
        !['10', '25', '50', '100'].includes(pageSize)) {
            return res.status(400).json({error: 'Invalid team filters or pagination.'});
        }

        res.setHeader('Cache-Control', 'private, no-store');
        try {
            const conditions = ['teams.unit_id = ?'];
            const params = [Number(unit)];
            if(size !== 'all') {
                conditions.push(`(SELECT current_size FROM teams t WHERE ${size === '6+' ? '>=' : '='} ?`);
                params.push(size === '6+' ? 6 : Number(size));
            }
            const where = conditions.join(' AND ');
            const [counts] = await db.query(`SELECT COUNT(*) AS total FROM teams WHERE ${where}`, params);
            const total = Number(counts[0].total);
            const totalPages = Math.max(1, Math.ceil(total / Number(pageSize)));
            const pagination = {page: Math.min(Number(page), totalPages), pageSize: Number(pageSize), total, totalPages};
            const [rows] = await db.query(
                `SELECT * FROM teams WHERE ${where} ORDER BY teams.created_at DESC, teams.team_id LIMIT ? OFFSET ?`,
                [...params, pagination.pageSize, (pagination.page - 1) * pagination.pageSize]
            );
            
            const teamsById = new Map();
            for(const row of rows) {
                if(!teamsById.has(row.team_id)) {
                    teamsById.set(row.team_id, {
                        team_id: row.team_id,
                        name: row.name,
                        current_size: row.current_size
                    });
                }
            }
            return res.status(200).json({teams: [...teamsById.values()], pagination});

        } catch(error) {
            console.error('Team listing failed:', error.code || error.message);
            return res.status(500).json({error: 'Unable to load teams. Please try again.'});
        }
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

        // Check if team_id is already in use
        const [teamIdCheck] = await db.query(`SELECT * FROM teams WHERE team_id = ?`, team_id);
        if(teamIdCheck.length) {
            return res.status(400).json({error: 'Cannot have duplicate Team IDs. Please create a different Team ID.'});
        }

        // Attempt to add team to unit - team id must be unique, so an error will be returned if it clashes
        await db.query(
            `INSERT INTO teams (team_id, name, unit_id, created_by) VALUES (?, ?, ?, ?)`,
            [team_id, name, unit, admin.studentId]
        );

        return res.status(200).json({ok: true});
    }

    // DELETE - delete a team from a unit
    if(req.method === 'DELETE') {
        const team_id = req.query.team;
        const name = req.query.name;
        const unit = req.query.unit;

        const [teamCheck] = await db.query(`SELECT * FROM teams WHERE team_id = ? AND name = ? AND unit_id = ?`,
            [team_id, name, unit]
        );
        if(!teamCheck) {
            return res.status(404).json({error: `Team ${name} not found in database. Please refresh list.`});
        }

        await db.query(
            `DELETE FROM teams WHERE team_id = ? AND name = ? AND unit_id = ?`,
            [team_id, name, unit]
        );
        return res.status(200).json({ok: true});
    }

    // Throw an error if incorrect method included in request
    return res.status(405).json({error: 'Failed to reach database'});
}