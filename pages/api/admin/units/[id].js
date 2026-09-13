// pages/api/admin/units/[id].js
// GET    — get a single unit with its constraints
// PUT    — edit unit details and constraints
// DELETE — delete a unit

import { getDb }       from '../../../../lib/db';
import { requireAuth } from '../../../../lib/session';

/**
 * @function handler
 * This function handles HTTP requests related to unit IDs:
 * GET    - get a single unit with its constraints
 * PUT    - edit unit details and constraints
 * DELETE - delete a unit
 * @param {*} req the HTTP request used to determine functionality
 * @param {*} res the HTTP response sent back to the calling page/function
 * @returns a response status code and a json object
 */
export default async function handler(req, res) {
  
  /**
   * @const student - the admin user
   * @const id - the unit id
   * @const db - the database
   */
  // Check user is logged in and is an admin
  const student = requireAuth(req, res);
  if (!student) return;
  if (!student.isAdmin) return res.status(403).json({ error: 'Admin access required.' });

  const { id } = req.query;
  const db = getDb();
  const [unitCode] = await db.query(`SELECT unit_code FROM units WHERE id = ?`, [id]);

  // GET — return a single unit with its constraints
  if (req.method === 'GET') {
    const [rows] = await db.query(`
      SELECT u.*, uc.min_size, uc.max_size, uc.max_new
      FROM units u
      LEFT JOIN unit_constraints uc ON uc.unit_id = u.id
      WHERE u.id = ?
    `, [id]);

    const [timeslots] = await db.query(`
      SELECT id, slot FROM timeslots WHERE unit_id = ? ORDER BY id
      `, [id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Unit not found.' });
    return res.status(200).json({ unit: rows[0], timeslots: timeslots });
  }

  // PUT — update unit name, semester and constraints
  if (req.method === 'PUT') {
    const { unit_name, semester, min_size, max_size, max_new } = req.body;
    // Validation checks
    if(max_size < min_size || min_size === 0 || max_size === 0) {
      return res.status(400).json({error: 'Invalid team size parameters.'});
    }

    // Check unit exists
    const [unit] = await db.query('SELECT * FROM units WHERE id = ?', [id]);
    if (!unit.length) return res.status(404).json({ error: 'Unit not found.' });

    // Update unit name and semester
    await db.query(
      'UPDATE units SET unit_name = ?, semester = ? WHERE id = ?',
      [unit_name, semester, id]
    );

    // Update constraints
    await db.query(
      'UPDATE unit_constraints SET min_size = ?, max_size = ?, max_new = ? WHERE unit_id = ?',
      [min_size, max_size, max_new, id]
    );

    // Unlock locked groups in the unit to force revalidation of unit constraints
    const [lockedGroups] = await db.query('SELECT * FROM \`groups\` WHERE unit_id = ? and status = ?', [id, 'locked']);
    
    for(let i = 0; i < lockedGroups.length; i++) {
      await db.query('UPDATE \`groups\` SET status = ? WHERE group_id = ?', ['forming', lockedGroups[i].group_id]);
    }

    return res.status(200).json({ ok: true });
  }

  // DELETE — remove unit, its constraints and enrolments
  if (req.method === 'DELETE') {
    // Check unit exists
    const [unit] = await db.query('SELECT * FROM units WHERE id = ?', [id]);
    if (!unit.length) return res.status(404).json({ error: 'Unit not found.' });

    // Prevent deletion if unit has groups
    const [[{ c }]] = await db.query(
      'SELECT COUNT(*) as c FROM `groups` WHERE unit_id = ?', [id]
    );
    if (c > 0) {
      return res.status(400).json({ error: 'Cannot delete a unit that has groups. Delete all groups first.' });
    }

    // Delete constraints and enrolments before deleting the unit
    await db.query('DELETE FROM unit_constraints WHERE unit_id = ?', [id]);
    await db.query('DELETE FROM unit_enrolments WHERE unit_id = ?', [unitCode.unit_code]);
    await db.query('DELETE FROM units WHERE id = ?', [id]);

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}