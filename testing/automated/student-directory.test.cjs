// Run with npm run test:directory. Uses a disposable database, never the application tables.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const mysql = require('mysql2/promise');
const { loadEnvConfig } = require('@next/env');

const root = path.resolve(__dirname, '../..');
loadEnvConfig(root);

test('Student Directory: real SQL pagination and access boundaries', async (t) => {
  const database = `teamup_directory_test_${process.pid}_${Date.now()}`;
  assert.match(database, /^teamup_directory_test_\d+_\d+$/);
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost', port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root', password: process.env.MYSQL_PASSWORD || 'rootpassword',
  });
  let created = false;
  try {
    await db.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    created = true;
    await db.query(`USE \`${database}\``);
    await db.query('CREATE TABLE students (student_id VARCHAR(20) PRIMARY KEY, teamup_id VARCHAR(20), name VARCHAR(100), email VARCHAR(100), cohort VARCHAR(10), is_new TINYINT, is_admin TINYINT, password VARCHAR(255))');
    await db.query('CREATE TABLE unit_enrolments (id INT AUTO_INCREMENT PRIMARY KEY, unit_id VARCHAR(20), student_id VARCHAR(20))');
    await db.query('CREATE TABLE availability (student_id VARCHAR(20), slot VARCHAR(20))');
    await db.query('CREATE TABLE `groups` (group_id VARCHAR(20) PRIMARY KEY, name VARCHAR(100), type VARCHAR(20), status VARCHAR(20))');
    await db.query('CREATE TABLE group_members (id INT AUTO_INCREMENT PRIMARY KEY, group_id VARCHAR(20), student_id VARCHAR(20))');
    const fixtures = Array.from({ length: 76 }, (_, i) => {
      const number = i + 1;
      const id = String(number).padStart(4, '0');
      return {
        studentId: 'test' + id, teamupId: 'tu' + id,
        name: number === 8 ? 'Percent%_! Learner' : 'Student ' + (number === 29 ? '0028' : id),
        email: id + '@example.test', cohort: number % 2 ? '2025' : '2026',
        isNew: number % 2 === 0, admin: number === 76,
        slots: number % 3 === 0 ? ['MON-09:00', 'WED-11:00'] : ['FRI-13:00'],
        grouped: number % 5 === 0,
      };
    });
    await db.query('INSERT INTO students VALUES ?', [fixtures.map((s) => [s.studentId, s.teamupId, s.name, s.email, s.cohort, s.isNew, s.admin, 'private-password'])]);
    await db.query('INSERT INTO unit_enrolments (unit_id, student_id) VALUES ?', [fixtures.map((s, i) => [i < 63 || s.admin ? 'UNIT-A' : 'UNIT-B', s.studentId])]);
    await db.query('INSERT INTO unit_enrolments (unit_id, student_id) VALUES (?, ?)', ['UNIT-A', fixtures[0].studentId]);
    await db.query('INSERT INTO availability VALUES ?', [fixtures.flatMap((s) => s.slots.map((slot) => [s.studentId, slot]))]);
    await db.query('INSERT INTO availability VALUES (?, ?)', [fixtures[0].studentId, 'FRI-13:00']);
    await db.query('INSERT INTO `groups` VALUES (?, ?, ?, ?)', ['G-TEST', 'Test Group', 'public', 'forming']);
    await db.query('INSERT INTO group_members (group_id, student_id) VALUES ?', [fixtures.filter((s) => s.grouped).map((s) => ['G-TEST', s.studentId])]);

    // Load the real route and session code; inject only the connection to the isolated database.
    const sessionModule = new vm.SourceTextModule(readFileSync(path.join(root, 'lib/session.js'), 'utf8'));
    await sessionModule.link(async (specifier) => new vm.SyntheticModule(['default'], function () { this.setExport('default', require(specifier)); }));
    await sessionModule.evaluate();
    const statements = [];
    const dbModule = new vm.SyntheticModule(['getDb'], function () {
      this.setExport('getDb', () => ({ query(sql, params) { statements.push(sql); return db.query(sql, params); } }));
    });
    const apiModule = new vm.SourceTextModule(readFileSync(path.join(root, 'pages/api/students/index.js'), 'utf8'));
    await apiModule.link(async (specifier) => specifier.endsWith('/db') ? dbModule : sessionModule);
    await apiModule.evaluate();
    const token = sessionModule.namespace.createToken({ studentId: fixtures[0].studentId, name: fixtures[0].name });
    async function request(query = {}, options = {}) {
      const res = { code: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
      await apiModule.namespace.default({ method: options.method || 'GET', query, headers: { cookie: options.cookie ?? 'teamup_token=' + token } }, res);
      return res;
    }
    const classmates = fixtures.slice(0, 63);
    await t.test('unauthenticated and unsupported requests are rejected', async () => {
      assert.equal((await request({}, { cookie: '' })).code, 401);
      assert.equal((await request({}, { cookie: 'teamup_token=invalid' })).code, 401);
      const response = await request({}, { method: 'POST' });
      assert.equal(response.code, 405);
      assert.equal(response.headers.Allow, 'GET');
    });
    await t.test('default page returns 25 records, unit-wide totals and filter options', async () => {
      statements.length = 0;
      const response = await request({ page: '1' });
      assert.equal(response.code, 200);
      assert.equal(response.data.students.length, 25);
      assert.deepEqual(response.data.pagination, { page: 1, pageSize: 25, total: 63, totalPages: 3 });
      assert.deepEqual(response.data.stats, { total: 63, available: 51, inGroups: 12, newStudents: 31 });
      assert.deepEqual(response.data.filters.cohorts, ['2025', '2026']);
      assert.deepEqual(response.data.filters.slots, ['FRI-13:00', 'MON-09:00', 'WED-11:00']);
      assert.ok(statements.some((sql) => sql.includes('LIMIT ? OFFSET ?')));
      assert.ok(statements.filter((sql) => sql.includes('student_id IN (?)')).length === 2);
      assert.equal(response.headers['Cache-Control'], 'private, no-store');
    });
    await t.test('all pages have no duplicates, including equal names and duplicate enrolments', async () => {
      const ids = [];
      for (const page of ['1', '2', '3']) ids.push(...(await request({ page })).data.students.map((s) => s.studentId));
      assert.equal(ids.length, 63);
      assert.equal(new Set(ids).size, 63);
      assert.deepEqual([...ids].sort(), classmates.map((s) => s.studentId).sort());
    });
    await t.test('combined filters search the whole unit before pagination', async () => {
      const response = await request({ page: '1', status: 'available', experience: 'new', cohort: '2026', slot: 'MON-09:00', q: 'STUDENT' });
      const expected = classmates.filter((s) => !s.grouped && s.isNew && s.slots.includes('MON-09:00'));
      assert.deepEqual(response.data.students.map((s) => s.studentId).sort(), expected.map((s) => s.studentId).sort());
      assert.equal(response.data.pagination.total, expected.length);
      assert.equal(response.data.stats.total, 63);
    });
    await t.test('student IDs, TeamUp IDs, emails and tutorials are searchable', async () => {
      for (const q of ['test0063', 'tu0063', '0063@example.test']) {
        assert.deepEqual((await request({ page: '1', q })).data.students.map((s) => s.studentId), ['test0063']);
      }
      assert.equal((await request({ page: '1', q: 'wed-11:00' })).data.pagination.total, 21);
    });
    await t.test('SQL wildcard characters and quotes are treated as search text', async () => {
      assert.equal((await request({ page: '1', q: '%_!' })).data.pagination.total, 1);
      assert.equal((await request({ page: '1', q: "' OR 1=1 --" })).data.pagination.total, 0);
    });
    await t.test('student type and group status filters return the correct population', async () => {
      for (const status of ['available', 'grouped']) {
        const response = await request({ page: '1', pageSize: '100', status });
        assert.equal(response.data.students.length, status === 'available' ? 51 : 12);
        assert.ok(response.data.students.every((s) => Boolean(s.group) === (status === 'grouped')));
      }
      assert.equal((await request({ page: '1', experience: 'returning' })).data.pagination.total, 32);
    });
    await t.test('sort is deterministic and optional page sizes stay bounded', async () => {
      for (const pageSize of ['10', '25', '50', '100']) {
        const response = await request({ page: '1', pageSize, sort: 'id-asc' });
        assert.equal(response.data.students.length, Math.min(63, Number(pageSize)));
        assert.equal(response.data.students[0].studentId, 'test0001');
      }
      assert.equal((await request({ page: '1', sort: 'name-desc' })).data.students[0].studentId, 'test0063');
    });
    await t.test('out-of-range pages clamp to the last page and empty results are consistent', async () => {
      const last = (await request({ page: '999' })).data;
      assert.equal(last.pagination.page, 3);
      assert.equal(last.students.length, 13);
      const empty = (await request({ page: '999', q: 'no-matching-student' })).data;
      assert.deepEqual(empty.pagination, { page: 1, pageSize: 25, total: 0, totalPages: 1 });
      assert.deepEqual(empty.students, []);
    });
    await t.test('invalid pagination and filters are rejected before querying', async () => {
      for (const query of [{ page: '0' }, { page: '-2' }, { page: '1.5' }, { page: 'Infinity' }, { pageSize: '500' }, { sort: 'name; DROP TABLE students' }, { q: ['a', 'b'] }, { q: 'x'.repeat(101) }, { status: 'unknown' }, { experience: 'invalid' }]) {
        assert.equal((await request(query)).code, 400);
      }
    });
    await t.test('legacy profile lookup still includes students beyond the first page, without private fields', async () => {
      const response = await request();
      assert.equal(response.data.students.length, 63);
      assert.ok(response.data.students.some((s) => s.teamupId === 'tu0063'));
      assert.equal(response.data.pagination, undefined);
      assert.ok(response.data.students.every((s) => !('password' in s) && !('is_admin' in s)));
      assert.equal(response.data.students.find((s) => s.studentId === 'test0001').slots.length, 1);
    });
    await t.test('students without an enrolment receive a clear error', async () => {
      const unenrolled = sessionModule.namespace.createToken({ studentId: 'not-enrolled' });
      const response = await request({ page: '1' }, { cookie: 'teamup_token=' + unenrolled });
      assert.equal(response.code, 400);
      assert.match(response.data.error, /not enrolled/);
    });
  } finally {
    try { if (created) await db.query(`DROP DATABASE \`${database}\``); }
    finally { await db.end(); }
  }
});
