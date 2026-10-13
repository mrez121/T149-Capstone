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
 * PUT - Validate and atomically replace the groups allocated to a team.
 * @param {*} req - the HTML request
 * @param {*} res - the HTML response
 * @returns a HTML status code and a json object
 */
export default async function handler(req, res) {
    // Admin authentication check
    const admin = requireAuth(req, res);
    if(!admin) {
        return res.status(401).json({error: "Admin access is required."});
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
        const {teamGroups, teamSize} = req.body || {};

        // Reject malformed requests before making any allocation changes. Empty teams are allowed.
        if(typeof unitId !== 'string' || !unitId.trim() ||
            typeof teamId !== 'string' || !teamId.trim() ||
            !Array.isArray(teamGroups) ||
            teamGroups.some(group => typeof group !== 'string' || !group.trim() || group.length > 20) ||
            new Set(teamGroups).size !== teamGroups.length ||
            !Number.isSafeInteger(teamSize) || teamSize < 0) {
            return res.status(400).json({error: 'Invalid team allocation.'});
        }

        let connection;
        let transactionStarted = false;
        try {
            // A transaction must use one connection, rather than separate queries on the pool.
            connection = await db.getConnection();
            await connection.beginTransaction();
            transactionStarted = true;

            // Serialize saves to this team and prevent it being deleted during the save.
            const [teamExists] = await connection.query(
                'SELECT * FROM teams WHERE team_id = ? AND unit_id = ? FOR UPDATE',
                [teamId, unitId]
            );
            if(!teamExists.length) {
                throw Object.assign(new Error('Team not found'), {status: 404});
            }

            if(teamGroups.length) {
                // Lock the shared group rows before checking allocations. This also serializes
                // two administrators trying to assign the same group to different teams.
                const [selectedGroups] = await connection.query(
                    `SELECT group_id, unit_id, status FROM \`groups\`
                    WHERE group_id IN (?) ORDER BY group_id FOR UPDATE`,
                    [teamGroups]
                );
                if(selectedGroups.length !== teamGroups.length ||
                    selectedGroups.some(group => String(group.unit_id) !== unitId || group.status !== 'locked')) {
                    throw Object.assign(new Error('Select locked groups from this unit.'), {status: 400});
                }

                // A locking read sees allocations committed while waiting for the group locks.
                // Groups already belonging to this team are valid selections.
                const [conflicts] = await connection.query(
                    `SELECT group_id FROM team_groups
                    WHERE group_id IN (?) AND team_id != ? FOR UPDATE`,
                    [teamGroups, teamId]
                );
                if(conflicts.length) {
                    throw Object.assign(
                        new Error(`Group ${conflicts[0].group_id} is already allocated to a team.`),
                        {status: 403}
                    );
                }
            }

            // Change allocations only after all selections pass validation. If any write fails,
            // rollback restores both the original allocations and the team's previous size.
            await connection.query('DELETE FROM team_groups WHERE team_id = ?', [teamId]);
            for(const group of teamGroups) {
                await connection.query(
                    'INSERT INTO team_groups (team_id, group_id) VALUES (?, ?)',
                    [teamId, group]
                );
            }
            await connection.query(
                'UPDATE teams SET current_size = ? WHERE team_id = ?',
                [teamSize, teamId]
            );

            await connection.commit();
            transactionStarted = false;
            return res.status(200).json({ok: true});
        } catch(error) {
            if(transactionStarted) {
                try {
                    await connection.rollback();
                } catch(rollbackError) {
                    console.error('Failed to roll back team allocation:', rollbackError);
                    // Never return a connection with an uncertain transaction to the pool.
                    connection.destroy();
                    connection = null;
                }
            }

            if(!error.status) {
                console.error('Failed to update team allocation:', error);
            }
            return res.status(error.status || 500).json({
                error: error.status ? error.message : 'Unable to save team changes. Please try again.',
            });
        } finally {
            if(connection) {
                connection.release();
            }
        }
    }

    // Throw an error if incorrect method included in request
    return res.status(405).json({error: 'Failed to reach database'});
}
