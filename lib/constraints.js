// lib/constraints.js
// TeamUp constraint validation engine

import { getDb } from './db';

/**
 * @function getStudentSlots
 * @async
 * Function to get the availability of the provided studentId
 * @param {*} studentId 
 * @returns a Set object containing the availability slots of the student
 */
export async function getStudentSlots(studentId) {
  const db   = getDb();
  const [rows] = await db.query(
    'SELECT slot FROM availability WHERE student_id = ?', [studentId]
  );
  return new Set(rows.map(r => r.slot));
}

/**
 * @function findSharedSlots
 * @async
 * Function to find what availability slots are shared between students in a group
 * @param {Array} studentIds an array of studentIds
 * @returns a Set object containing shared availability slots
 */
export async function findSharedSlots(studentIds) {
  if (!studentIds.length) return new Set();
  let shared = await getStudentSlots(studentIds[0]);
  for (const id of studentIds.slice(1)) {
    const slots = await getStudentSlots(id);
    shared = new Set([...shared].filter(s => slots.has(s)));
  }
  return shared;
}

/**
 * @function getGroupMembers
 * @async
 * Function that gets all students in a group
 * @param {*} groupId the groupId of the group
 * @returns an array of student objects
 */
export async function getGroupMembers(groupId) {
  const db = getDb();
  const [rows] = await db.query(`
    SELECT s.* FROM students s
    JOIN group_members gm ON s.student_id = gm.student_id
    WHERE gm.group_id = ?
  `, [groupId]);
  return rows;
}

/**
 * @function validateJoin
 * @async
 * A function to validate if a group's constraints will be broken by a student joining.
 * @param {*} groupId the groupId of the group the student is joining
 * @param {*} joiningStudentId the studentId of the student attempting to join
 * @returns {ok: @type boolean, errors: @type [string], sharedSlots: @type Set}
 */
export async function validateJoin(groupId, joiningStudentId) {
  const db     = getDb();
  const errors = [];

  //Acquire unit that group belongs to
  const [unit] = await db.query(
    'SELECT unit_id FROM \`groups\` where group_id = ?',
    groupId
  );
  if(!unit.length) {
    return {ok: false, errors: ''}
  }
  //Acquire the unit's constraints
  const [unitConstraints] = await db.query(
    'SELECT * FROM unit_constraints where id = ?',
    [unit[0].unit_id]
  );

  //Unit constraints are limited to max team size and max number of new students
  const unitMaxSize = unitConstraints[0].max_size;
  const unitMaxNew = unitConstraints[0].max_new;

  // Already a member?
  const [already] = await db.query(
    'SELECT id FROM group_members WHERE group_id = ? AND student_id = ?',
    [groupId, joiningStudentId]
  );
  if (already.length > 0) {
    return { ok: false, errors: ['You are already in this group.'], sharedSlots: [] };
  }

  // Group exists and not locked?
  const [grpRows] = await db.query(
    'SELECT * FROM `groups` WHERE group_id = ?', [groupId]
  );
  if (!grpRows.length) return { ok: false, errors: ['Group not found.'], sharedSlots: [] };
  if (grpRows[0].status === 'locked') {
    return { ok: false, errors: ['This group is locked.'], sharedSlots: [] };
  }

  const members   = await getGroupMembers(groupId);
  const memberIds = members.map(m => m.student_id);
  const allIds    = [...memberIds, joiningStudentId];

  // Constraint 1: size
  if (allIds.length > unitMaxSize) {
    errors.push(`Group is full — maximum size is ${unitMaxSize} members.`);
  }

  // Constraint 2: new students
  const [joinerRows] = await db.query(
    'SELECT * FROM students WHERE student_id = ?', [joiningStudentId]
  );
  if (joinerRows[0]?.is_new) {
    const currentNew = members.filter(m => m.is_new).length;
    if (currentNew >= unitMaxNew) {
      errors.push(`Group already has ${unitMaxNew} new students — maximum allowed.`);
    }
  }

  // Constraint 3: shared slot
  const shared = await findSharedSlots(allIds);
  if (shared.size < 1) {
    errors.push('No shared tutorial slot found between all members.');
  }

  return { ok: errors.length === 0, errors, sharedSlots: [...shared] };
}

/**
 * @function validateGroupReady
 * @async
 * Function that validates if a group is ready to be locked
 * @param {*} groupId the groupId of the group being validated
 * @returns {ok: @type boolean, errors: @type [string], sharedSlots: @type Set}
 */
export async function validateGroupReady(groupId) {
  const errors  = [];
  const members = await getGroupMembers(groupId);
  const db = getDb();

  //Acquire unit that group belongs to
  const [unit] = await db.query(
    'SELECT unit_id FROM \`groups\` where group_id = ?',
    groupId
  );
  if(!unit.length) {
    return {ok: false, errors: ''}
  }
  //Acquire the unit's constraints
  const [unitConstraints] = await db.query(
    'SELECT * FROM unit_constraints where id = ?',
    unit[0].unit_id
  );

  //Unit constraints are limited to max team size and max number of new students
  const unitMaxSize = unitConstraints[0].max_size;
  const unitMaxNew = unitConstraints[0].max_new;

  if (members.length > unitMaxSize) {
    errors.push(`Group has too many members to lock (maximum ${unitMaxSize}).`);
  }

  const newCount = members.filter(m => m.is_new).length;
  if (newCount > unitMaxNew) {
    errors.push(`Group has too many new students (${newCount}/${unitMaxNew}).`);
  }

  const shared = await findSharedSlots(members.map(m => m.student_id));
  if (shared.size === 0) {
    errors.push('No shared tutorial slot exists across all current members.');
  }

  return { ok: errors.length === 0, errors, sharedSlots: [...shared] };
}
