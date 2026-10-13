// pages/api/admin/units/teams_team.js
// GET - fetch a single team in a unit for editing
// POST - edit a team

import { getDb } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/session";

/**
 * @function handler
 * @async
 * Handle API requests related to team information edits
 * GET - Retrieve the team to be edited
 * POST - Update team details
 * @param {*} req - the HTML request 
 * @param {*} res - the HTML response
 * @returns a HTML response code and a json object
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

    // GET - return a single team for editing
    if(req.method === 'GET') {
        const teamId = req.query.teamId;
        const unit = req.query.unit;

        const [rows] = await db.query(
            `SELECT * FROM teams WHERE team_id = ? AND unit_id = ?`,
            [teamId, unit]
        );
        if(!rows.length) {
            return res.status(404).json({error: 'Team not found.'});
        }
        return res.status(200).json({team: rows[0]});
    }

    // POST - Edit team details
    if(req.method === 'POST') {
        const submitType = req.body.submit_type;
        
        // Edit team details
        if(submitType === 'editTeam') {
            const {team_id, name} = req.body;
            if(!team_id || !name) {
                return res.status(400).json({error: 'Team ID and Name are required.'});
            }
            if(team_id.length > 20) {
                return res.status(400).json({error: "Invalid Team ID."});
            }
            if(name.length > 100) {
                return res.status(400).json({error: "Invalid Team Name."});
            }

            // Check team exists
            const [team] = await db.query('SELECT * FROM teams WHERE team_id = ?', [team_id]);
            if(!team.length) {
                return res.status(404).json({error: 'Team not found.'});
            }
            // Update team name
            const updateTeam = await db.query(
                'UPDATE teams SET name = ? WHERE team_id = ?',
                [name, team_id]
            );
            if(!updateTeam) {
                return res.status(500).json({error: 'Failed to update team details - encountered a problem with the server'});
            }

            return res.status(200).json({ok: true});
        }
    }

    // Throw an error if incorrect method included in request
    return res.status(405).json({error: 'Failed to reach database'});
}