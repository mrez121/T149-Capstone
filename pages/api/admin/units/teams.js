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

    if(req.method === 'GET') {
        // Get teams
    }

    if(req.method === 'POST') {
        const submitType = req.body.submit_type;

        if(submitType === 'createTeam') {
            // Code for adding team to DB here
        }
        if(submitType === 'editTeam') {
            //Code for editing team details here
        }
        if(submitType === 'addGroup') {
            //Code for adding group to team here
        }
        if(submitType === 'removeGroup') {
            //Code for removing group from team here
        }

    }

    if(req.method === 'DELETE') {
        // Delete a team
    }

    // Throw an error if incorrect method included in request
    return res.status(405).json({error: 'Failed to reach database'});
}