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

    }

    if(req.method === 'POST') {

    }

    if(req.method === 'DELETE') {

    }

    // Throw an error if incorrect method included in request
    return res.status(405).json({error: 'Failed to reach database'});
}