// lib/constraints.js
// TeamUp constraint validation engine

import { getDb } from './db';

export const MIN_SIZE         = 4;
export const MAX_SIZE         = 5;
export const MAX_NEW_STUDENTS = 2;

export async function getStudentSlots(studentId) {
  const db   = getDb();
  const [rows] = await db.query(
    'SELECT slot FROM availability WHERE student_id = ?', [studentId]
  );
  return new Set(rows.map(r => r.slot));
}

export async function findSharedSlots(studentIds) {
  if (!studentIds.length) return new Set();
  let shared = await getStudentSlots(studentIds[0]);
  for (const id of studentIds.slice(1)) {
    const slots = await getStudentSlots(id);
    shared = new Set([...shared].filter(s => slots.has(s)));
  }
  return shared;
}

export async function getGroupMembers(groupId) {
  const db = getDb();
  const [rows] = await db.query(`
    SELECT s.* FROM students s
    JOIN group_members gm ON s.student_id = gm.student_id
    WHERE gm.group_id = ?
  `, [groupId]);
  return rows;
}

export async function validateJoin(groupId, joiningStudentId) {
  const db     = getDb();
  const errors = [];

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
  if (allIds.length > MAX_SIZE) {
    errors.push(`Group is full — maximum size is ${MAX_SIZE} members.`);
  }

  // Constraint 2: new students
  const [joinerRows] = await db.query(
    'SELECT * FROM students WHERE student_id = ?', [joiningStudentId]
  );
  if (joinerRows[0]?.is_new) {
    const currentNew = members.filter(m => m.is_new).length;
    if (currentNew >= MAX_NEW_STUDENTS) {
      errors.push(`Group already has ${MAX_NEW_STUDENTS} new students — maximum allowed.`);
    }
  }

  // Constraint 3: shared slot
  const shared = await findSharedSlots(allIds);
  if (shared.size < 1) {
    errors.push('No shared tutorial slot found between all members.');
  }

  return { ok: errors.length === 0, errors, sharedSlots: [...shared] };
}

export async function validateGroupReady(groupId) {
  const errors  = [];
  const members = await getGroupMembers(groupId);

  if (members.length < MIN_SIZE) {
    errors.push(`Group needs at least ${MIN_SIZE} members to lock (currently ${members.length}).`);
  }

  const shared = await findSharedSlots(members.map(m => m.student_id));
  if (shared.size === 0) {
    errors.push('No shared tutorial slot exists across all current members.');
  }

  return { ok: errors.length === 0, errors, sharedSlots: [...shared] };
}
