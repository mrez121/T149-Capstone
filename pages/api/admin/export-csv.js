// pages/api/admin/export-csv.js
// GET — export groups, members and unenrolled students for a unit as CSV

import { getDb }       from '../../../lib/db';
import { requireAuth } from '../../../lib/session';

/**
 * @function handler
 * @async
 * Handler function for fetching data to be exported to a CSV file
 * @param {*} req - a html request
 * @param {*} res - a html response
 * @returns a html response code and a csv file that can be downloaded by the user.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  const student = requireAuth(req, res);
  if (!student) return;
  if (!student.isAdmin) return res.status(403).json({ error: 'Admin access required.' });

  const { unitCode, fullExport } = req.query;
  if (!unitCode) return res.status(400).json({ error: 'unitCode is required.' });
  if(!fullExport) {
    return res.status(400).json({error: 'Export type is required.'});
  }

  const db = getDb();

  // Get unit details
  const [unitRows] = await db.query(
    'SELECT * FROM units WHERE unit_code = ?', [unitCode.toUpperCase()]
  );
  if (!unitRows.length) return res.status(404).json({ error: 'Unit not found.' });
  const unit = unitRows[0];

  // Get unit constraints
  const [constraints] = await db.query(
    'SELECT * FROM unit_constraints WHERE unit_id = ?', [unit.id]
  );
  const con = constraints[0] || { min_size: 4, max_size: 5, max_new: 2 };

  // Check for full export
  if(fullExport === 'true') {
    // Get all students enrolled in this unit
    const [enrolledStudents] = await db.query(`
      SELECT s.student_id, s.name, s.email, s.is_new, s.cohort
      FROM students s
      JOIN unit_enrolments ue ON ue.student_id = s.student_id
      WHERE ue.unit_id = ?
      ORDER BY s.name ASC
    `, [unit.id]);

    // Get all groups in this unit
    const [groups] = await db.query(`
      SELECT g.group_id, g.name, g.status, g.shared_slot,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id) AS member_count,
        (SELECT COUNT(*) FROM group_members gm2
        JOIN students s2 ON s2.student_id = gm2.student_id
        WHERE gm2.group_id = g.group_id AND s2.is_new = 1) AS new_count
      FROM \`groups\` g
      WHERE g.unit_id = ?
      ORDER BY g.name ASC
    `, [unit.id]);

    // Get all group members
    const [members] = await db.query(`
      SELECT gm.group_id, s.student_id, s.name, s.email, s.is_new, s.cohort
      FROM group_members gm
      JOIN students s ON s.student_id = gm.student_id
      JOIN \`groups\` g ON g.group_id = gm.group_id
      WHERE g.unit_id = ?
      ORDER BY gm.group_id, s.name ASC
    `, [unit.id]);

    // Find students not in any group
    const studentsInGroups   = new Set(members.map(m => m.student_id));
    const unenrolledStudents = enrolledStudents.filter(s => !studentsInGroups.has(s.student_id));

    // Build CSV rows
    const rows = [];

    // Header
    rows.push([
      'student_id',
      'student_name',
      'student_email',
      'cohort',
      'is_new',
      'group_id',
      'group_name',
      'group_status',
      'shared_slot',
      'constraint_min_size',
      'constraint_max_size',
      'constraint_new_students',
      'all_constraints_met'
    ].join(','));

    // Group member rows
    for (const group of groups) {
      const groupMembers = members.filter(m => m.group_id === group.group_id);

      // Check each constraint individually
      const minSizeOk = group.member_count >= con.min_size;
      const maxSizeOk = group.member_count <= con.max_size;
      const newOk     = group.new_count <= con.max_new;
      const slotOk    = !!group.shared_slot;
      const allMet    = minSizeOk && maxSizeOk && newOk && slotOk;

      if (groupMembers.length === 0) {
        // Empty group
        rows.push([
          '', '', '', '', '',
          group.group_id, `"${group.name}"`, group.status,
          group.shared_slot || 'none',
          minSizeOk ? 'true' : 'false',
          maxSizeOk ? 'true' : 'false',
          newOk     ? 'true' : 'false',
          allMet    ? 'true' : 'false'
        ].join(','));
      } else {
        for (const member of groupMembers) {
          rows.push([
            member.student_id,
            `"${member.name}"`,
            member.email,
            member.cohort,
            member.is_new ? 'NEW' : 'RETURNING',
            group.group_id,
            `"${group.name}"`,
            group.status,
            group.shared_slot || 'none',
            minSizeOk ? 'true' : 'false',
            maxSizeOk ? 'true' : 'false',
            newOk     ? 'true' : 'false',
            allMet    ? 'true' : 'false'
          ].join(','));
        }
      }
    }

    // Students not in any group
    for (const s of unenrolledStudents) {
      rows.push([
        s.student_id,
        `"${s.name}"`,
        s.email,
        s.cohort,
        s.is_new ? 'NEW' : 'RETURNING',
        'NO_GROUP', '', '', '', '', '', '', ''
      ].join(','));
    }

    // Send as downloadable CSV
    const csv      = rows.join('\n');
    const filename = `${unit.unit_code}_export.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  }
  else if(fullExport === 'false') {
    const [enrolledStudents] = await db.query(`
      SELECT s.student_id
      FROM students s
      JOIN unit_enrolments ue ON ue.student_id = s.student_id
      WHERE ue.unit_id = ?
      ORDER BY s.id ASC
    `, [unit.id]);

    // Build CSV rows
    const rows = [];

    // Header
    rows.push([
      'student_id',
    ].join(','));

    for(const student of enrolledStudents) {
      rows.push([
        student.student_id
      ].join(','));
    }
    const csv = rows.join('\n');
    const filename = `${unit.unit_code}_student_id_export.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  }  
}