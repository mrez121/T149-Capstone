// pages/api/admin/units/groups.js
// GET - groups in a unit

import { getDb } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/session";

/**
 * @function handler
 * @async
 * This function handles HTTP requests for viewing and managing groups.
 * GET - view a page of groups in a specified unit, including member counts and details.
 * Each group retains group_id, name, status and created_by, and adds:
 * member_count (number) and members (student_id, teamup_id, name, is_new, cohort).
 * is_new is a boolean; groups without members return member_count: 0 and members: [].
 * Optional status and size filters apply before pagination (25 groups by default).
 * pagination returns page, pageSize, total and totalPages for the filtered results.
 * POST - unlock a locked group, allowing students to leave or join the group again.
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and a json object
 */
export default async function handler(req, res) {
    /**
     * @const admin
     * @const db
     * @const unit
     * @const rows
     * @const groupsById
     * @const pagination
     * @const row
     * @const group
     * @const grpRows
     */
    const admin = requireAuth(req, res);
    if(!admin) return;
    if(!admin.isAdmin) {
        return res.status(403).json({error: 'Admin access is required.'});
    }
    const db = getDb();

    // GET - filter and page groups in a unit
    if(req.method === 'GET') {
        const unit = req.query.unit;
        if(typeof unit !== 'string' || !/^[1-9]\d*$/.test(unit) || !Number.isSafeInteger(Number(unit))) {
            return res.status(400).json({error: 'A valid unit ID is required.'});
        }
        const {status = 'all', size = 'all', page = '1', pageSize = '25'} = req.query;
        if(['status', 'size', 'page', 'pageSize'].some(key => req.query[key] !== undefined && typeof req.query[key] !== 'string') ||
            !['all', 'forming', 'locked'].includes(status) || !['all', '0', '1', '2', '3', '4', '5', '6+'].includes(size) ||
            !/^[1-9]\d*$/.test(page) || !Number.isSafeInteger(Number(page)) || !['10', '25', '50', '100'].includes(pageSize)) {
            return res.status(400).json({error: 'Invalid group filters or pagination.'});
        }

        res.setHeader('Cache-Control', 'private, no-store');
        try {
            const conditions = ['g.unit_id = ?'];
            const params = [Number(unit)];
            if(status !== 'all') {
                conditions.push('g.status = ?');
                params.push(status);
            }
            if(size !== 'all') {
                conditions.push(`(SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.group_id) ${size === '6+' ? '>=' : '='} ?`);
                params.push(size === '6+' ? 6 : Number(size));
            }
            const where = conditions.join(' AND ');
            const [counts] = await db.query(`SELECT COUNT(*) AS total FROM \`groups\` g WHERE ${where}`, params);
            const total = Number(counts[0].total);
            const totalPages = Math.max(1, Math.ceil(total / Number(pageSize)));
            // Clamp the page when an unlock or membership change removes its last result.
            const pagination = {page: Math.min(Number(page), totalPages), pageSize: Number(pageSize), total, totalPages};

            // Page groups before joining members, so a page never cuts a group's member list.
            const [rows] = await db.query(
                `SELECT g.group_id, g.name, g.status, g.created_by,
                    s.student_id AS member_student_id, s.teamup_id AS member_teamup_id,
                    s.name AS member_name, s.is_new AS member_is_new, s.cohort AS member_cohort
                FROM (
                    SELECT g.group_id, g.name, g.status, g.created_by, g.created_at
                    FROM \`groups\` g WHERE ${where}
                    ORDER BY g.created_at DESC, g.group_id LIMIT ? OFFSET ?
                ) g
                LEFT JOIN group_members gm ON gm.group_id = g.group_id
                LEFT JOIN students s ON s.student_id = gm.student_id
                ORDER BY g.created_at DESC, g.group_id, gm.joined_at, gm.id`,
                [...params, pagination.pageSize, (pagination.page - 1) * pagination.pageSize]
            );

            // Each joined row represents a member; collect the rows into their groups.
            const groupsById = new Map();
            for (const row of rows) {
                if(!groupsById.has(row.group_id)) {
                    groupsById.set(row.group_id, {
                        group_id: row.group_id, name: row.name, status: row.status,
                        created_by: row.created_by, member_count: 0, members: [],
                    });
                }
                const group = groupsById.get(row.group_id);
                if(row.member_student_id !== null) {
                    group.members.push({
                        student_id: row.member_student_id, teamup_id: row.member_teamup_id,
                        name: row.member_name, is_new: Boolean(row.member_is_new),
                        cohort: row.member_cohort,
                    });
                    group.member_count = group.members.length;
                }
            }
            return res.status(200).json({groups: [...groupsById.values()], pagination});
        } catch (error) {
            console.error('Group listing failed:', error.code || error.message);
            return res.status(500).json({error: 'Unable to load groups. Please try again.'});
        }
    }

    //POST - unlock a locked group
    if(req.method === 'POST') {
        //grab group id (e.g. G-57BAC1) from url
        const unit = req.query.groupId;
        const [grpRows] = await db.query(
            `SELECT * FROM \`groups\` WHERE group_id = ?`, unit
        );
        if(!grpRows.length) {
            return res.status(404).json({error: 'Group not found.'});
        }
        if(grpRows[0].status !== 'locked') {
            return res.status(400).json({error: `${grpRows[0].name} is already unlocked.`});
        }

        await db.query(
            `UPDATE \`groups\` SET status = 'forming' WHERE group_id = ?`, grpRows[0].group_id 
        );

        return res.status(200).json({ok: true});
    }

    //Throw an error if incorrect method included in request
    return res.status(405).json({error: 'Failed to reach database'});
}
