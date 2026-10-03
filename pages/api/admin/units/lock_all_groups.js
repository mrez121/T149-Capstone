// pages/api/admin/units/lock_all_groups.js
// POST - lock all groups in a unit

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

    if(req.method === 'POST') {
        const unit = req.query.unit;
        const unitCode = req.query.unitCode;

        const [unitExists] = await db.query(
            `SELECT * FROM units WHERE id = ? AND unit_code = ?`,
            [unit, unitCode]
        );
        if(!unitExists) {
            return res.status(404).json({error: 'Unit not found.'});
        }

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