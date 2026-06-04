// lib/seed.js
const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const config = {
  host:     'localhost',
  port:     3306,
  user:     'root',
  password: 'rootpassword',
};

const students = [
  { id: 'n10000001', name: 'Alice Chen',     email: 'alice.chen@student.qut.edu.au',     isNew: 0, cohort: '2023' },
  { id: 'n10000002', name: 'Ben Nguyen',     email: 'ben.nguyen@student.qut.edu.au',     isNew: 0, cohort: '2023' },
  { id: 'n10000003', name: 'Clara Smith',    email: 'clara.smith@student.qut.edu.au',    isNew: 0, cohort: '2022' },
  { id: 'n10000004', name: 'Daniel Park',    email: 'daniel.park@student.qut.edu.au',    isNew: 1, cohort: '2024' },
  { id: 'n10000005', name: 'Eva Martinez',   email: 'eva.martinez@student.qut.edu.au',   isNew: 1, cohort: '2024' },
  { id: 'n10000006', name: 'Frank Li',       email: 'frank.li@student.qut.edu.au',       isNew: 0, cohort: '2023' },
  { id: 'n10000007', name: 'Grace Kim',      email: 'grace.kim@student.qut.edu.au',      isNew: 0, cohort: '2022' },
  { id: 'n10000008', name: 'Henry Wilson',   email: 'henry.wilson@student.qut.edu.au',   isNew: 1, cohort: '2024' },
  { id: 'n10000009', name: 'Isabella Jones', email: 'isabella.jones@student.qut.edu.au', isNew: 0, cohort: '2023' },
  { id: 'n10000010', name: 'James Brown',    email: 'james.brown@student.qut.edu.au',    isNew: 0, cohort: '2022' },
];

const availability = {
  n10000001: ['MON-09:00', 'MON-11:00', 'WED-09:00', 'FRI-13:00'],
  n10000002: ['MON-09:00', 'TUE-13:00', 'WED-11:00', 'THU-11:00'],
  n10000003: ['MON-09:00', 'WED-09:00', 'WED-13:00', 'FRI-09:00'],
  n10000004: ['MON-09:00', 'MON-11:00', 'TUE-09:00', 'FRI-13:00'],
  n10000005: ['MON-09:00', 'WED-11:00', 'THU-09:00', 'FRI-13:00'],
  n10000006: ['MON-09:00', 'WED-09:00', 'WED-13:00', 'FRI-09:00'],
  n10000007: ['MON-09:00', 'TUE-13:00', 'WED-09:00', 'THU-13:00'],
  n10000008: ['MON-09:00', 'WED-09:00', 'THU-11:00', 'FRI-11:00'],
  n10000009: ['MON-09:00', 'TUE-09:00', 'WED-13:00', 'FRI-09:00'],
  n10000010: ['MON-09:00', 'MON-11:00', 'WED-09:00', 'FRI-13:00'],
};

async function seed() {
  const conn = await mysql.createConnection(config);

  await conn.query('CREATE DATABASE IF NOT EXISTS teamup');
  await conn.query('USE teamup');
  console.log('✓ Database created');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS students (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(20) UNIQUE NOT NULL,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(100) UNIQUE NOT NULL,
      password   VARCHAR(255) NOT NULL,
      is_new     TINYINT DEFAULT 0,
      cohort     VARCHAR(10) NOT NULL
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS availability (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(20) NOT NULL,
      slot       VARCHAR(20) NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(student_id)
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`groups\` (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      group_id    VARCHAR(20) UNIQUE NOT NULL,
      name        VARCHAR(100) NOT NULL,
      type        ENUM('public','private') DEFAULT 'public',
      status      ENUM('forming','locked') DEFAULT 'forming',
      shared_slot VARCHAR(20),
      created_by  VARCHAR(20) NOT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES students(student_id)
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS group_members (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      group_id   VARCHAR(20) NOT NULL,
      student_id VARCHAR(20) NOT NULL,
      joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_member (group_id, student_id),
      FOREIGN KEY (group_id)   REFERENCES \`groups\`(group_id),
      FOREIGN KEY (student_id) REFERENCES students(student_id)
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS invites (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      group_id        VARCHAR(20) NOT NULL,
      from_student_id VARCHAR(20) NOT NULL,
      to_student_id   VARCHAR(20) NOT NULL,
      status          ENUM('pending','accepted','declined') DEFAULT 'pending',
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_invite (group_id, to_student_id),
      FOREIGN KEY (group_id)        REFERENCES \`groups\`(group_id),
      FOREIGN KEY (from_student_id) REFERENCES students(student_id),
      FOREIGN KEY (to_student_id)   REFERENCES students(student_id)
    )
  `);

  console.log('✓ Tables created');

  for (const s of students) {
    const hash = bcrypt.hashSync('password123', 10);
    await conn.query(
      `INSERT IGNORE INTO students (student_id, name, email, password, is_new, cohort) VALUES (?, ?, ?, ?, ?, ?)`,
      [s.id, s.name, s.email, hash, s.isNew, s.cohort]
    );
    await conn.query('DELETE FROM availability WHERE student_id = ?', [s.id]);
    for (const slot of availability[s.id]) {
      await conn.query('INSERT INTO availability (student_id, slot) VALUES (?, ?)', [s.id, slot]);
    }
  }

  console.log('✓ 10 students seeded');
  console.log('✓ Tutorial slots loaded');
  await conn.end();
  console.log('\n✓ Done — run: npm run dev');
}

seed().catch(err => {
  console.error('Seed error:', err.message);
  process.exit(1);
});
