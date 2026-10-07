// pages/api/admin/units/teams_groups.js
// GET - get locked groups in a unit that can be assigned to a team
// PUT - add a group to a team

import { getDb } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/session";

/**
 * @function handler
 * @async
 * Handler function for managing requests related team groups.
 * GET - Retrieve locked groups in a unit for team assignment
 * PUT - Update the groups allocated to a team.
 * @param {*} req - the HTML request
 * @param {*} res - the HTML response
 * @returns a HTML status code and a json object
 */
export default async function handler(req, res) {
    // Admin authentication check
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
        // Retrieve all groups in the unit, along with member and new student counts for each group
        const [allGroups] = await db.query(
            `SELECT g.*,
                (SELECT COUNT(*) FROM group_members gm 
                    LEFT JOIN students s ON s.student_id = gm.student_id 
                    WHERE group_id = g.group_id AND s.is_new = 1) AS new_count,
                (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id) AS group_member_count
            FROM \`groups\` g
            WHERE g.unit_id = ? AND g.status = 'locked'
            ORDER BY g.created_at ASC
            `, [unitId]
        );
        // Retrieve groups that are allocated to other teams
        const [otherTeamGroups] = await db.query(
            `SELECT group_id FROM team_groups WHERE team_id != ?`, [teamId]
        );
        // Filter out groups that are allocated to other teams
        const groups = allGroups.filter(group => !otherTeamGroups.some(otherGroups => otherGroups.group_id === group.group_id));

        // Retrieve unit constraints
        const [constraints] = await db.query(
            `SELECT * FROM unit_constraints WHERE unit_id = ?`, [unitId]
        );

        // Retrieve groups for the current team alongside the current team's size and new student count
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

        // Check that the team exists
        const [teamExists] = await db.query('SELECT * FROM teams WHERE team_id = ? AND unit_id = ?', [teamId, unitId]);
        if(!teamExists.length) {
            return res.status(404).json({error: 'Team not found'});
        }

        // Remove the team's current allocation of groups.
        await db.query(
            `DELETE FROM team_groups WHERE team_id = ?`,
            [teamId]
        );

        // If groups have been allocated to the team, save them in the DB here.
        if(teamGroups) {
            for(const group of teamGroups) {
                // Check if selected group is already in another team
                let [groupCheck] = await db.query(
                    `SELECT * FROM team_groups WHERE group_id = ?`, group
                );
                console.log(groupCheck);
                if(groupCheck.length) {
                    return res.status(403).json({error: `Group ${group} is already allocated to a team.`});
                }
                let [update] = await db.query(
                    `INSERT INTO team_groups (team_id, group_id) VALUES (?, ?)
                    ON DUPLICATE KEY UPDATE id=id`,
                    [teamId, group]
                );
                if(!update) {
                    return res.status(500).json({error: 'Failed to update team - encountered a problem with the server.'});
                }
            }
        }

        // Update the team's size in the DB
        const teamSizeUpdate = await db.query(
            `UPDATE teams SET current_size = ? WHERE team_id = ?`,
            [teamSize, teamId]
        );
        
        return res.status(200).json({ok: true});
    }

    // Throw an error if incorrect method included in request
    return res.status(405).json({error: 'Failed to reach database'});
}