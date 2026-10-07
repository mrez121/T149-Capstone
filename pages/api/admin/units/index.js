// pages/api/admin/units/index.js
// GET  — list all units with constraints and student/group counts
// POST — create a new unit and set its constraints

import { getDb }       from '../../../../lib/db';
import { requireAuth } from '../../../../lib/session';

/**
 * @function handler
 * @async
 * This function handles API requests for units
 * GET  - list all units with constraints and student/group counts
 * POST - create a new unit and set its constraints
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and a json object
 */
export default async function handler(req, res) {

  // Check user is logged in and is an admin
  const student = requireAuth(req, res);
  if (!student) return;
  if (!student.isAdmin) return res.status(403).json({ error: 'Admin access required.' });

  const db = getDb();

  // GET — return all units with their constraints and counts
  if (req.method === 'GET') {
    const [units] = await db.query(`
      SELECT u.*,
        uc.min_size, uc.max_size, uc.max_new,
        (SELECT COUNT(*) FROM unit_enrolments WHERE unit_id = u.id) AS student_count,
        (SELECT COUNT(*) FROM \`groups\` WHERE unit_id = u.id) AS group_count,
        (SELECT COUNT(*) FROM \`groups\` WHERE unit_id = u.id AND \`groups\`.status = 'locked') AS locked_count,
        (SELECT COUNT(*) FROM teams WHERE unit_id = u.id) AS team_count
      FROM units u
      LEFT JOIN unit_constraints uc ON uc.unit_id = u.id
      ORDER BY u.created_at DESC
    `);
    return res.status(200).json({ units });
  }

  // POST — create a new unit and its constraints
  if (req.method === 'POST') {
    const { unit_code, unit_name, semester, min_size = 4, max_size = 5, max_new = 2 } = req.body;

    // Validate required fields
    if (!unit_code || !unit_name || !semester) {
      return res.status(400).json({ error: 'unit_code, unit_name and semester are required.' });
    }

    // Check unit code is not already taken
    const [existing] = await db.query(
      'SELECT id FROM units WHERE unit_code = ?', [unit_code.toUpperCase()]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: `Unit code ${unit_code.toUpperCase()} already exists.` });
    }

    // Insert the new unit
    const [result] = await db.query(
      'INSERT INTO units (unit_code, unit_name, semester, created_by) VALUES (?, ?, ?, ?)',
      [unit_code.toUpperCase(), unit_name, semester, student.studentId]
    );
    
    const unitId = result.insertId;

    // Insert constraints using the new unit ID
    await db.query(
      'INSERT INTO unit_constraints (unit_id, min_size, max_size, max_new) VALUES (?, ?, ?, ?)',
      [unitId, min_size, max_size, max_new]
    );
    
    return res.status(201).json({ ok: true, unitId, unit_code: unit_code.toUpperCase() });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}