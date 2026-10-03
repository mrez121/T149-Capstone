// pages/api/admin/units/teams_groups.js
// GET - get locked groups in a unit that can be assigned to a team
// PUT - add a group to a team

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
        const teamId = req.query.teamId;
        const [groups] = await db.query(
            `SELECT g.*,
                (SELECT COUNT(*) FROM group_members gm 
                    LEFT JOIN students s ON s.student_id = gm.student_id 
                    WHERE group_id = g.group_id AND s.is_new = 1) AS new_count,
                (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id) AS group_member_count
            FROM \`groups\` g
            LEFT JOIN team_groups tg ON tg.group_id = g.group_id
            WHERE g.unit_id = ? AND g.status = 'locked'
            ORDER BY g.created_at ASC
            `, [unitId]
        );
        const [constraints] = await db.query(
            `SELECT * FROM unit_constraints WHERE unit_id = ?`, [unitId]
        );
        const [teamGroups] = await db.query(
            `SELECT tg.*,
                (SELECT COUNT(*) FROM group_members gm
                    LEFT JOIN students s ON s.student_id = gm.student_id
                    WHERE group_id = tg.group_id AND s.is_new = 1) AS new_count,
                (SELECT COUNT(*) FROM group_members WHERE group_id = tg.group_id) AS group_member_count
            FROM team_groups tg
            WHERE tg.team_id = ?
            `, [teamId]
        );
        return res.status(200).json({groups, constraints, teamGroups});
    }

    // PUT - add and remove groups from a team
    if(req.method === 'PUT') {
        const unitId = req.query.unit;
        const teamId = req.query.teamId;
        const {teamGroups, teamSize} = req.body;
        console.log(teamGroups);

        const [teamExists] = await db.query('SELECT * FROM teams WHERE team_id = ? AND unit_id = ?', [teamId, unitId]);
        if(!teamExists.length) {
            return res.status(404).json({error: 'Team not found'});
        }

        await db.query(
            `DELETE FROM team_groups WHERE team_id = ?`,
            [teamId]
        );

        if(teamGroups) {
            for(const group of teamGroups) {
                let update = await db.query(
                    `INSERT INTO team_groups (team_id, group_id) VALUES (?, ?)
                    ON DUPLICATE KEY UPDATE id=id`,
                    [teamId, group]
                );
                if(!update) {
                    return res.status(500).json({error: 'Failed to update team - encountered a problem with the server.'});
                }
            }
        }

        const teamSizeUpdate = await db.query(
            `UPDATE teams SET current_size = ? WHERE team_id = ?`,
            [teamSize, teamId]
        );
        
        return res.status(200).json({ok: true});
    }

    // Throw an error if incorrect method included in request
    return res.status(405).json({error: 'Failed to reach database'});
}