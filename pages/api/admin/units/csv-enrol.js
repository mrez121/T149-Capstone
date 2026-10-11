// pages/api/admin/units/csv-enrol.js
// POST — enrol multiple students into a unit via CSV upload

import { getDb }       from '../../../../lib/db';
import { requireAuth } from '../../../../lib/session';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

/**
 * @function handler
 * @async
 * Handles CSV bulk enrolment into a unit.
 * Expects a POST request with { unitCode, csvText } in the body.
 * csvText should be a string with one student_id per line.
 * @param {*} req
 * @param {*} res
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  // Check user is logged in and is an admin
  const student = requireAuth(req, res);
  if (!student) return;
  if (!student.isAdmin) return res.status(403).json({ error: 'Admin access required.' });

  const { unitCode, csvText } = req.body;

  if (!unitCode || !csvText) {
    return res.status(400).json({ error: 'unitCode and csvText are required.' });
  }

  const db = getDb();

  // Check unit exists and get its id
  const [unitRows] = await db.query(
    'SELECT id, unit_code FROM units WHERE unit_code = ?',
    [unitCode.toUpperCase()]
  );
  if (!unitRows.length) {
    return res.status(404).json({ error: `Unit ${unitCode} not found.` });
  }
  const unitId = unitRows[0].id;

  // Parse CSV — one student_id per line, skip header and empty lines
  const lines = csvText
    .split('\n')
    .map(line => line.trim().toLowerCase())
    .filter(line => line && line !== 'student_id');

  if (lines.length === 0) {
    return res.status(400).json({ error: 'CSV file is empty or has no valid student IDs.' });
  }

  const results = {
    enrolled:   [],   // successfully enrolled
    skipped:    [],   // already enrolled
    notFound:   [],   // student ID not in database
  };

  // Process each student ID from the CSV
  for (const studentId of lines) {
    // Check student exists in the database
    const [studentRows] = await db.query(
      'SELECT student_id FROM students WHERE student_id = ?',
      [studentId]
    );

    if (!studentRows.length) {
      results.notFound.push(studentId);
      continue;
    }

    // Check if already enrolled in this unit
    const [existing] = await db.query(
      'SELECT id FROM unit_enrolments WHERE student_id = ?',
      [studentId]
    );

    if (existing.length > 0) {
      results.skipped.push(studentId);
    }
    else {
      // Enrol the student
      await db.query(
        'INSERT IGNORE INTO unit_enrolments (unit_id, student_id) VALUES (?, ?)',
        [unitId, studentId]
      );
      results.enrolled.push(studentId);
    }    
    
  }

  return res.status(200).json({
    ok: true,
    unitCode: unitCode.toUpperCase(),
    summary: {
      total:    lines.length,
      enrolled: results.enrolled.length,
      skipped:  results.skipped.length,
      notFound: results.notFound.length,
    },
    results,
  });
}