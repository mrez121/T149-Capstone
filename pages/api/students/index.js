import { getDb } from '../../../lib/db';
import { requireAuth } from '../../../lib/session';

const SORTS = {
  'name-asc': 's.name ASC, s.student_id ASC',
  'name-desc': 's.name DESC, s.student_id ASC',
  'id-asc': 's.student_id ASC',
};

/**
 * Read public directory fields within the authenticated student's first unit.
 * Supplying page/pageSize enables server pagination; the parameterless response
 * stays compatible with the existing Student Profile page.
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const student = requireAuth(req, res);
  if (!student) return;
  res.setHeader('Cache-Control', 'private, no-store');

  const fields = ['page', 'pageSize', 'q', 'status', 'experience', 'cohort', 'slot', 'sort'];
  if (fields.some((key) => req.query[key] !== undefined && typeof req.query[key] !== 'string')) {
    return res.status(400).json({ error: 'Directory parameters must have a single value.' });
  }
  const {
    q = '', status = 'all', experience = 'all', cohort = '', slot = '', sort = 'name-asc',
  } = req.query;
  const paginated = req.query.page !== undefined || req.query.pageSize !== undefined;
  const requestedPage = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 25);
  if (!Number.isSafeInteger(requestedPage) || requestedPage < 1 ||
      ![10, 25, 50, 100].includes(pageSize) ||
      !['all', 'available', 'grouped'].includes(status) ||
      !['all', 'new', 'returning'].includes(experience) ||
      !Object.hasOwn(SORTS, sort) || q.length > 100 || cohort.length > 100 || slot.length > 100) {
    return res.status(400).json({ error: 'Invalid directory filters or pagination.' });
  }

  try {
    const db = getDb();
    const [units] = await db.query(
      'SELECT unit_id FROM unit_enrolments WHERE student_id = ? ORDER BY id LIMIT 1',
      [student.studentId],
    );
    if (!units.length) {
      return res.status(400).json({ error: 'Student is not enrolled in a unit.' });
    }
    const unit = units[0].unit_id;
    // EXISTS avoids duplicate students when enrolment or availability rows repeat.
    const scope = `s.is_admin != 1 AND EXISTS (
      SELECT 1 FROM unit_enrolments ue WHERE ue.student_id = s.student_id AND ue.unit_id = ?
    )`;
    const hasGroup = `EXISTS (
      SELECT 1 FROM group_members gm JOIN \`groups\` g ON g.group_id = gm.group_id
      WHERE gm.student_id = s.student_id
    )`;
    const conditions = [scope];
    const params = [unit];
    if (status !== 'all') conditions.push(status === 'available' ? `NOT ${hasGroup}` : hasGroup);
    if (experience !== 'all') {
      conditions.push('s.is_new = ?');
      params.push(experience === 'new' ? 1 : 0);
    }
    if (cohort) { conditions.push('s.cohort = ?'); params.push(cohort); }
    if (slot) {
      conditions.push('EXISTS (SELECT 1 FROM availability a WHERE a.student_id = s.student_id AND a.slot = ?)');
      params.push(slot);
    }
    if (q.trim()) {
      // Treat user-entered percent/underscore literally, not as SQL wildcards.
      const pattern = `%${q.trim().replace(/[!%_]/g, '!$&')}%`;
      conditions.push(`(s.name LIKE ? ESCAPE '!' OR s.student_id LIKE ? ESCAPE '!'
        OR s.teamup_id LIKE ? ESCAPE '!' OR s.email LIKE ? ESCAPE '!'
        OR s.cohort LIKE ? ESCAPE '!' OR EXISTS (
          SELECT 1 FROM availability a WHERE a.student_id = s.student_id AND a.slot LIKE ? ESCAPE '!'
        ))`);
      params.push(...Array(6).fill(pattern));
    }
    const where = conditions.join(' AND ');
    let pagination;
    let stats;
    let filters;
    let limit = '';
    let rowParams = params;

    if (paginated) {
      const [[countRows], [summaryRows], [cohorts], [slots]] = await Promise.all([
        db.query(`SELECT COUNT(*) AS total FROM students s WHERE ${where}`, params),
        db.query(`SELECT COUNT(*) AS total, COALESCE(SUM(NOT ${hasGroup}), 0) AS available,
          COALESCE(SUM(s.is_new = 1), 0) AS newStudents FROM students s WHERE ${scope}`, [unit]),
        db.query(`SELECT DISTINCT s.cohort FROM students s WHERE ${scope} ORDER BY s.cohort`, [unit]),
        db.query(`SELECT DISTINCT a.slot FROM availability a JOIN students s ON s.student_id = a.student_id
          WHERE ${scope} ORDER BY a.slot`, [unit]),
      ]);
      const total = Number(countRows[0].total);
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const page = Math.min(requestedPage, totalPages);
      pagination = { page, pageSize, total, totalPages };
      const summary = summaryRows[0];
      stats = {
        total: Number(summary.total), available: Number(summary.available),
        inGroups: Number(summary.total) - Number(summary.available), newStudents: Number(summary.newStudents),
      };
      filters = { cohorts: cohorts.map((row) => row.cohort).filter(Boolean), slots: slots.map((row) => row.slot).filter(Boolean) };
      limit = ' LIMIT ? OFFSET ?';
      rowParams = [...params, pageSize, (page - 1) * pageSize];
    }

    const [rows] = await db.query(`
      SELECT s.student_id, s.teamup_id, s.name, s.email, s.is_new, s.cohort
      FROM students s WHERE ${where} ORDER BY ${SORTS[sort]}${limit}
    `, rowParams);
    const ids = rows.map((row) => row.student_id);
    let slotRows = [];
    let groupRows = [];
    let profileRows = [];
    // Load details only for this page, avoiding a full scan of every student's data.
    if (ids.length) {
      [[slotRows], [groupRows], [profileRows]] = await Promise.all([
        db.query('SELECT DISTINCT student_id, slot FROM availability WHERE student_id IN (?) ORDER BY slot', [ids]),
        db.query(`SELECT gm.student_id, g.group_id, g.name, g.type, g.status
          FROM group_members gm JOIN \`groups\` g ON g.group_id = gm.group_id
          WHERE gm.student_id IN (?) ORDER BY gm.id`, [ids]),
        db.query(`SELECT student_id, preffered_name, bio, skills, interests, contact_method, contact_handle, remote_student
          FROM student_profiles
          WHERE student_id IN (?) ORDER BY id`, [ids]),
      ]);
    }
    const slotsByStudent = new Map();
    for (const row of slotRows) {
      const slots = slotsByStudent.get(row.student_id) || [];
      slots.push(row.slot);
      slotsByStudent.set(row.student_id, slots);
    }
    const groupsByStudent = new Map(groupRows.map((row) => [row.student_id, row]));
    const profileByStudent = new Map(profileRows.map((row) => [row.student_id, row]));
    const students = rows.map((row) => {
      const group = groupsByStudent.get(row.student_id);
      const profile = profileByStudent.get(row.student_id);
      return {
        studentId: row.student_id, teamupId: row.teamup_id, name: row.name,
        email: row.email, isNew: Boolean(row.is_new), cohort: row.cohort,
        slots: slotsByStudent.get(row.student_id) || [],
        group: group ? { groupId: group.group_id, name: group.name, type: group.type, status: group.status } : null,
        profile: profile ? {
          prefferedName: profile.preffered_name,
          bio: profile.bio,
          skills: profile.skills,
          interests: profile.interests,
          contactMethod: profile.contact_method,
          contactHandle: profile.contact_handle,
          remoteStudent: profile.remote_student
        } : null,
      };
    });
    return res.status(200).json({ student, students, unit, ...(paginated ? { pagination, stats, filters } : {}) });
  } catch (error) {
    console.error('Student directory query failed:', error.code || error.message);
    return res.status(500).json({ error: 'Unable to load the student directory. Please try again.' });
  }
}
