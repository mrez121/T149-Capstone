// Run with node --experimental-vm-modules --test testing/automated/group-management.test.cjs.
// All fixtures live in a disposable database.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const mysql = require('mysql2/promise');
const { loadEnvConfig } = require('@next/env');

const root = path.resolve(__dirname, '../..');
loadEnvConfig(root);

test('Group Management: member details, unit isolation and existing unlock behavior', async (t) => {
  const database = `teamup_groups_test_${process.pid}_${Date.now()}`;
  assert.match(database, /^teamup_groups_test_\d+_\d+$/);
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost', port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root', password: process.env.MYSQL_PASSWORD || 'rootpassword',
  });
  let created = false;
  try {
    await db.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    created = true;
    await db.query(`USE \`${database}\``);
    await db.query('CREATE TABLE units (id INT PRIMARY KEY, unit_code VARCHAR(20))');
    await db.query('CREATE TABLE students (student_id VARCHAR(20) PRIMARY KEY, teamup_id VARCHAR(20), name VARCHAR(100), is_new TINYINT, cohort VARCHAR(10), email VARCHAR(100), password VARCHAR(255), is_admin TINYINT)');
    await db.query("CREATE TABLE `groups` (group_id VARCHAR(20) PRIMARY KEY, name VARCHAR(100), status ENUM('forming','locked'), created_by VARCHAR(20), unit_id INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (unit_id) REFERENCES units(id), FOREIGN KEY (created_by) REFERENCES students(student_id))");
    await db.query('CREATE TABLE group_members (id INT AUTO_INCREMENT PRIMARY KEY, group_id VARCHAR(20), student_id VARCHAR(20), joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY unique_member (group_id, student_id), FOREIGN KEY (group_id) REFERENCES `groups`(group_id), FOREIGN KEY (student_id) REFERENCES students(student_id))');
    await db.query("INSERT INTO units VALUES (1, 'UNIT-A'), (2, 'UNIT-B'), (3, 'UNIT-LARGE'), (4, 'UNIT-EMPTY')");

    const students = Array.from({ length: 516 }, (_, i) => ({
      student_id: 'test' + String(i).padStart(4, '0'), teamup_id: 'tu' + i,
      name: i < 3 ? 'Same Name' : i === 3 ? '测试学生' : 'Student ' + i,
      is_new: i % 2 === 0, cohort: i % 2 ? '2025' : '2026',
    }));
    await db.query('INSERT INTO students VALUES ?', [students.map((s) => [s.student_id, s.teamup_id, s.name, s.is_new, s.cohort, 'private@example.test', 'private-password', 0])]);
    const fixtures = Array.from({ length: 6 }, (_, size) => ({
      group_id: `G-SIZE-${size}`, name: `Group of ${size}`, status: size === 4 ? 'locked' : 'forming',
      created_by: students[0].student_id, unit_id: 1,
    }));
    fixtures.push({ group_id: 'G-OTHER', name: 'Other Unit', status: 'forming', created_by: students[15].student_id, unit_id: 2 });
    const largeGroups = Array.from({ length: 100 }, (_, i) => ({
      group_id: 'G-LARGE-' + String(i).padStart(3, '0'), name: 'Large ' + i,
      status: i >= 60 && i < 90 ? 'locked' : 'forming', created_by: students[16 + i * 5].student_id, unit_id: 3,
    }));
    await db.query('INSERT INTO `groups` (group_id, name, status, created_by, unit_id, created_at) VALUES ?', [
      [...fixtures, ...largeGroups].map((g) => [g.group_id, g.name, g.status, g.created_by, g.unit_id, '2026-09-09 00:00:00']),
    ]);
    const expectedMembers = new Map();
    let nextStudent = 0;
    const memberships = [];
    for (let size = 0; size <= 5; size++) {
      const members = students.slice(nextStudent, nextStudent + size);
      nextStudent += size;
      expectedMembers.set(`G-SIZE-${size}`, members);
      memberships.push(...members.map((s) => [`G-SIZE-${size}`, s.student_id, '2026-09-09 01:00:00']));
    }
    memberships.push(['G-OTHER', students[15].student_id, '2026-09-09 01:00:00']);
    largeGroups.forEach((g, i) => memberships.push(...students.slice(16 + i * 5, 21 + i * 5).map((s) => [g.group_id, s.student_id, '2026-09-09 01:00:00'])));
    await db.query('INSERT INTO group_members (group_id, student_id, joined_at) VALUES ?', [memberships]);

    // Exercise the real route, authentication and SQL with only the DB connection replaced.
    const sessionModule = new vm.SourceTextModule(readFileSync(path.join(root, 'lib/session.js'), 'utf8'));
    await sessionModule.link(async (specifier) => new vm.SyntheticModule(['default'], function () { this.setExport('default', require(specifier)); }));
    await sessionModule.evaluate();
    let queryCount = 0;
    let failQuery = false;
    const dbModule = new vm.SyntheticModule(['getDb'], function () {
      this.setExport('getDb', () => ({ query(sql, params) {
        queryCount++;
        if (failQuery) return Promise.reject(Object.assign(new Error('Simulated connection failure'), { code: 'TEST_CONNECTION_FAILURE' }));
        return db.query(sql, params);
      } }));
    });
    const apiModule = new vm.SourceTextModule(readFileSync(path.join(root, 'pages/api/admin/units/groups.js'), 'utf8'));
    await apiModule.link(async (specifier) => specifier.endsWith('/db') ? dbModule : sessionModule);
    await apiModule.evaluate();
    const adminToken = sessionModule.namespace.createToken({ studentId: 'test-admin', isAdmin: 1 });
    const studentToken = sessionModule.namespace.createToken({ studentId: students[0].student_id, isAdmin: 0 });
    async function request(query = { unit: '1' }, options = {}) {
      const res = {
        code: 200, headers: {}, sent: false,
        setHeader(key, value) { this.headers[key] = value; },
        status(code) { assert.equal(this.sent, false, 'must not send a second response'); this.code = code; return this; },
        json(data) { assert.equal(this.sent, false, 'must not send a second response'); this.data = data; this.sent = true; return this; },
      };
      await apiModule.namespace.default({ method: options.method || 'GET', query, headers: { cookie: options.cookie ?? 'teamup_token=' + adminToken } }, res);
      return res;
    }

    await t.test('only authenticated admins can list or unlock groups', async () => {
      const before = queryCount;
      for (const method of ['GET', 'POST']) {
        assert.equal((await request({}, { method, cookie: '' })).code, 401);
        assert.equal((await request({}, { method, cookie: 'teamup_token=invalid' })).code, 401);
        assert.equal((await request({}, { method, cookie: 'teamup_token=' + studentToken })).code, 403);
      }
      assert.equal(queryCount, before);
    });
    await t.test('unit results retain original fields and exact member lists for sizes zero through five', async () => {
      const response = await request();
      assert.equal(response.code, 200);
      assert.equal(response.headers['Cache-Control'], 'private, no-store');
      assert.equal(response.data.groups.length, 6);
      assert.deepEqual(response.data.pagination, {page: 1, pageSize: 25, total: 6, totalPages: 1});
      assert.deepEqual(response.data.groups, fixtures.slice(0, 6).map(({ unit_id, ...g }) => ({
        ...g, member_count: expectedMembers.get(g.group_id).length, members: expectedMembers.get(g.group_id),
      })));
      assert.ok(response.data.groups.every((g) => g.member_count === g.members.length));
    });
    await t.test('courses stay isolated and courses without groups return an empty list', async () => {
      const other = (await request({ unit: '2' })).data.groups;
      assert.deepEqual(other.map((g) => g.group_id), ['G-OTHER']);
      assert.deepEqual(other[0].members, [students[15]]);
      for (const unit of ['4', '999']) {
        assert.deepEqual((await request({ unit })).data, {groups: [], pagination: {page: 1, pageSize: 25, total: 0, totalPages: 1}});
      }
    });
    await t.test('invalid and repeated unit parameters are rejected before querying', async () => {
      const before = queryCount;
      for (const unit of [undefined, '', '0', '-1', '1.5', '1abc', '1 OR 1=1', '9007199254740992', ['1', '2']]) {
        assert.equal((await request({ unit })).code, 400);
      }
      assert.equal(queryCount, before);
    });
    await t.test('a course with 500 students returns complete members without duplicates', async () => {
      const allGroups = [];
      for (const page of ['1', '2', '3', '4']) {
        const response = await request({unit: '3', page});
        assert.equal(response.code, 200);
        assert.equal(response.data.groups.length, 25);
        assert.deepEqual(response.data.pagination, {page: Number(page), pageSize: 25, total: 100, totalPages: 4});
        allGroups.push(...response.data.groups);
      }
      assert.equal(new Set(allGroups.map(g => g.group_id)).size, 100);
      const ids = allGroups.flatMap((g) => g.members.map((s) => s.student_id));
      assert.equal(ids.length, 500);
      assert.equal(new Set(ids).size, 500);
      assert.deepEqual([...ids].sort(), students.slice(16).map((s) => s.student_id).sort());
      assert.ok(allGroups.every((g) => g.member_count === 5));
    });
    await t.test('status and size filters apply across all groups before pagination', async () => {
      const first = await request({unit: '3', status: 'locked', size: '5'});
      assert.equal(first.code, 200);
      assert.deepEqual(first.data.pagination, {page: 1, pageSize: 25, total: 30, totalPages: 2});
      assert.deepEqual(first.data.groups.map(g => g.group_id), largeGroups.slice(60, 85).map(g => g.group_id));
      const second = await request({unit: '3', status: 'locked', size: '5', page: '2'});
      assert.deepEqual(second.data.groups.map(g => g.group_id), largeGroups.slice(85, 90).map(g => g.group_id));
      for (const size of ['0', '1', '2', '3', '4', '5']) {
        const result = await request({unit: '1', size});
        assert.equal(result.data.pagination.total, 1);
        assert.equal(result.data.groups[0].member_count, Number(size));
      }
      const empty = await request({unit: '1', status: 'locked', size: '2', page: '99'});
      assert.deepEqual(empty.data, {groups: [], pagination: {page: 1, pageSize: 25, total: 0, totalPages: 1}});
    });
    await t.test('page size choices and out-of-range pages stay bounded with complete members', async () => {
      for (const pageSize of ['10', '25', '50', '100']) {
        const result = await request({unit: '3', pageSize, page: '999'});
        assert.equal(result.data.groups.length, Number(pageSize));
        assert.equal(result.data.pagination.page, 100 / Number(pageSize));
        assert.ok(result.data.groups.every(g => g.member_count === 5 && g.members.length === 5));
      }
    });
    await t.test('malformed filters and pagination fail before a database query', async () => {
      const before = queryCount;
      for (const query of [{page: '0'}, {page: '-1'}, {page: '1.5'}, {page: 'abc'}, {page: ['1','2']}, {page: '9007199254740992'}, {pageSize: '500'}, {pageSize: ['25']}, {size: '-1'}, {size: '6'}, {size: ['2']}, {status: 'invalid'}, {status: ['locked']}]) {
        assert.equal((await request({unit: '1', ...query})).code, 400);
      }
      assert.equal(queryCount, before);
    });
    await t.test('six-or-more filter returns complete members and stays within the course', async () => {
      const added = students.slice(0, 2);
      await db.query('INSERT INTO group_members (group_id, student_id) VALUES ?', [added.map(s => ['G-LARGE-099', s.student_id])]);
      try {
        const result = await request({unit: '3', size: '6+'});
        assert.equal(result.data.pagination.total, 1);
        assert.equal(result.data.groups[0].member_count, 7);
        assert.equal(result.data.groups[0].members.length, 7);
        assert.deepEqual((await request({unit: '1', size: '6+'})).data.groups, []);
      } finally {
        await db.query('DELETE FROM group_members WHERE group_id = ? AND student_id IN (?)', ['G-LARGE-099', added.map(s => s.student_id)]);
      }
    });
    await t.test('unlocking the final result on a filtered last page clamps to the previous page', async () => {
      await db.query("UPDATE `groups` SET status = 'forming' WHERE unit_id = 3");
      await db.query("UPDATE `groups` SET status = 'locked' WHERE group_id IN (?)", [largeGroups.slice(0, 26).map(g => g.group_id)]);
      const before = await request({unit: '3', status: 'locked', page: '2'});
      assert.deepEqual(before.data.groups.map(g => g.group_id), ['G-LARGE-025']);
      assert.equal((await request({groupId: 'G-LARGE-025'}, {method: 'POST'})).code, 200);
      const after = await request({unit: '3', status: 'locked', page: '2'});
      assert.deepEqual(after.data.pagination, {page: 1, pageSize: 25, total: 25, totalPages: 1});
      assert.equal(after.data.groups.length, 25);
      assert.ok(after.data.groups.every(g => g.status === 'locked' && g.group_id !== 'G-LARGE-025'));
    });
    await t.test('member changes are reflected in both the list and count on the next read', async () => {
      const removed = expectedMembers.get('G-SIZE-3')[0].student_id;
      await db.query('DELETE FROM group_members WHERE group_id = ? AND student_id = ?', ['G-SIZE-3', removed]);
      const group = (await request()).data.groups.find((g) => g.group_id === 'G-SIZE-3');
      assert.equal(group.member_count, 2);
      assert.deepEqual(group.members, expectedMembers.get('G-SIZE-3').slice(1));
    });
    await t.test('unlock still updates only the selected group and retains membership', async () => {
      assert.equal((await request({ groupId: 'G-SIZE-4' }, { method: 'POST' })).code, 200);
      const group = (await request()).data.groups.find((g) => g.group_id === 'G-SIZE-4');
      assert.equal(group.status, 'forming');
      assert.equal(group.member_count, 4);
      assert.deepEqual(group.members, expectedMembers.get('G-SIZE-4'));
      assert.equal((await request({ groupId: 'G-SIZE-4' }, { method: 'POST' })).code, 400);
      assert.equal((await request({ groupId: 'G-MISSING' }, { method: 'POST' })).code, 404);
      assert.equal((await request({}, { method: 'DELETE' })).code, 405);
    });
    await t.test('a database failure returns a readable error and the next request can recover', async () => {
      failQuery = true;
      try {
        const response = await request();
        assert.equal(response.code, 500);
        assert.deepEqual(response.data, { error: 'Unable to load groups. Please try again.' });
      } finally { failQuery = false; }
      assert.equal((await request()).code, 200);
    });
  } finally {
    try { if (created) await db.query(`DROP DATABASE \`${database}\``); }
    finally { await db.end(); }
  }
});
