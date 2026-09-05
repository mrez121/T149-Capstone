const readline = require('readline');
const fs = require('fs');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const uuidv4 = require('uuid');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function setup() {
  console.log('\n🚀 TeamUp Setup\n');

  const host     = await ask('MySQL host (press Enter for localhost): ') || 'localhost';
  const port     = await ask('MySQL port (press Enter for 3306): ')     || '3306';
  const user     = await ask('MySQL username (press Enter for root): ') || 'root';
  const password = await ask('MySQL password: ');

  // Test connection
  try {
    const conn = await mysql.createConnection({ host, port, user, password });
    await conn.end();
    console.log('✓ MySQL connection successful');
  } catch (err) {
    console.error('✗ Could not connect to MySQL:', err.message);
    rl.close();
    process.exit(1);
  }

  // Write .env.local
  const env = `MYSQL_HOST=${host}\nMYSQL_PORT=${port}\nMYSQL_USER=${user}\nMYSQL_PASSWORD=${password}\nMYSQL_DATABASE=teamup\nJWT_SECRET=teamup-jwt-secret-key-2026-qut-ifb398\n`;
  fs.writeFileSync('.env.local', env);
  console.log('✓ .env.local created');
  
  // Run seed
  const mysql2  = require('mysql2/promise');
  const conn    = await mysql2.createConnection({ host, port: Number(port), user, password });

  await conn.query('CREATE DATABASE IF NOT EXISTS teamup');
  await conn.query('USE teamup');
  await conn.query(`CREATE TABLE IF NOT EXISTS students (id INT AUTO_INCREMENT PRIMARY KEY, student_id VARCHAR(20) UNIQUE NOT NULL, teamup_id VARCHAR(20) UNIQUE NOT NULL, name VARCHAR(100) NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, is_new TINYINT DEFAULT 0, cohort VARCHAR(10) NOT NULL, is_admin TINYINT DEFAULT 0)`);
  await conn.query(`CREATE TABLE IF NOT EXISTS availability (id INT AUTO_INCREMENT PRIMARY KEY, student_id VARCHAR(20) NOT NULL, slot VARCHAR(20) NOT NULL, FOREIGN KEY (student_id) REFERENCES students(student_id))`);
  await conn.query(`CREATE TABLE IF NOT EXISTS units(id INT AUTO_INCREMENT PRIMARY KEY, unit_code VARCHAR(20) UNIQUE NOT NULL, unit_name VARCHAR(100) NOT NULL, semester VARCHAR(20) NOT NULL, created_by VARCHAR(20) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (created_by) REFERENCES students(student_id))`);
  await conn.query(`CREATE TABLE IF NOT EXISTS \`groups\` (id INT AUTO_INCREMENT PRIMARY KEY, group_id VARCHAR(20) UNIQUE NOT NULL, name VARCHAR(100) NOT NULL, type ENUM('public','private') DEFAULT 'public', status ENUM('forming','locked') DEFAULT 'forming', shared_slot VARCHAR(20), created_by VARCHAR(20) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, unit_id INT DEFAULT NULL, FOREIGN KEY (created_by) REFERENCES students(student_id), FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE)`);
  await conn.query(`CREATE TABLE IF NOT EXISTS group_members (id INT AUTO_INCREMENT PRIMARY KEY, group_id VARCHAR(20) NOT NULL, student_id VARCHAR(20) NOT NULL, joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY unique_member (group_id, student_id), FOREIGN KEY (group_id) REFERENCES \`groups\`(group_id) ON DELETE CASCADE, FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE)`);
  await conn.query(`CREATE TABLE IF NOT EXISTS invites (id INT AUTO_INCREMENT PRIMARY KEY, group_id VARCHAR(20) NOT NULL, from_student_id VARCHAR(20) NOT NULL, to_student_id VARCHAR(20) NOT NULL, status ENUM('pending','accepted','declined') DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY unique_invite (group_id, to_student_id), FOREIGN KEY (group_id) REFERENCES \`groups\`(group_id), FOREIGN KEY (from_student_id) REFERENCES students(student_id),FOREIGN KEY (to_student_id) REFERENCES students(student_id))`);
  await conn.query(`CREATE TABLE IF NOT EXISTS unit_constraints(id INT AUTO_INCREMENT PRIMARY KEY, unit_id VARCHAR(20) NOT NULL, min_size INT DEFAULT 4, max_size  INT DEFAULT 5, max_new INT DEFAULT 2, FOREIGN KEY (unit_id) REFERENCES units(unit_code) ON DELETE CASCADE)`);
  await conn.query(`CREATE TABLE IF NOT EXISTS unit_enrolments(id INT AUTO_INCREMENT PRIMARY KEY, unit_id VARCHAR(20) NOT NULL,student_id VARCHAR(20) NOT NULL, FOREIGN KEY (unit_id) REFERENCES units(unit_code) ON DELETE CASCADE, FOREIGN KEY (student_id) REFERENCES students(student_id))`);
  await conn.query(`CREATE TABLE IF NOT EXISTS student_profiles(id INT AUTO_INCREMENT PRIMARY KEY, student_id VARCHAR(20) UNIQUE NOT NULL, preffered_name VARCHAR(100), bio TEXT, skills VARCHAR(255), interests VARCHAR(255), contact_method VARCHAR(50), contact_handle VARCHAR(100), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (student_id) REFERENCES students(student_id))`);

const students = [
  { id: 'n10000001', name: 'Alice Chen',     email: 'alice.chen@student.qut.edu.au',     is_new: 0, cohort: '2023', is_admin: 0 },
  { id: 'n10000002', name: 'Ben Nguyen',     email: 'ben.nguyen@student.qut.edu.au',     is_new: 0, cohort: '2023', is_admin: 0 },
  { id: 'n10000003', name: 'Clara Smith',    email: 'clara.smith@student.qut.edu.au',    is_new: 0, cohort: '2022', is_admin: 0 },
  { id: 'n10000004', name: 'Daniel Park',    email: 'daniel.park@student.qut.edu.au',    is_new: 1, cohort: '2024', is_admin: 0 },
  { id: 'n10000005', name: 'Eva Martinez',   email: 'eva.martinez@student.qut.edu.au',   is_new: 1, cohort: '2024', is_admin: 0 },
  { id: 'n10000006', name: 'Frank Li',       email: 'frank.li@student.qut.edu.au',       is_new: 0, cohort: '2023', is_admin: 0 },
  { id: 'n10000007', name: 'Grace Kim',      email: 'grace.kim@student.qut.edu.au',      is_new: 0, cohort: '2022', is_admin: 0 },
  { id: 'n10000008', name: 'Henry Wilson',   email: 'henry.wilson@student.qut.edu.au',   is_new: 1, cohort: '2024', is_admin: 0 },
  { id: 'n10000009', name: 'Isabella Jones', email: 'isabella.jones@student.qut.edu.au', is_new: 0, cohort: '2023', is_admin: 0 },
  { id: 'n10000010', name: 'James Brown',    email: 'james.brown@student.qut.edu.au',    is_new: 0, cohort: '2022', is_admin: 0 },
];

const admins = [
  {id: 'bfarnsworth', name: 'Brandon Farnsworth', email: 'bf@qut.edu.au', is_new: null, cohort: 'Admin', is_admin: 1},
  {id: 'wlu',         name: 'Weiyi Lu',           email: 'wl@qut.edu.au', is_new: null, cohort: 'Admin', is_admin: 1},
  {id: 'mrezwani',    name: 'Mehdi Rezwani',      email: 'mr@qut.edu.au', is_new: null, cohort: 'Admin', is_admin: 1},
  {id: 'hwang',       name: 'Hongyun Wang',       email: 'hw@qut.edu.au', is_new: null, cohort: 'Admin', is_admin: 1},
];

  const availability = {
    n10000001: ['MON-09:00', 'MON-11:00', 'WED-09:00', 'FRI-13:00'],
    n10000002: ['MON-09:00', 'TUE-13:00', 'WED-09:00', 'THU-11:00'],
    n10000003: ['MON-09:00', 'WED-09:00', 'WED-13:00', 'FRI-09:00'],
    n10000004: ['MON-09:00', 'MON-11:00', 'TUE-09:00', 'FRI-13:00'],
    n10000005: ['MON-09:00', 'WED-11:00', 'THU-09:00', 'FRI-13:00'],
    n10000006: ['MON-09:00', 'WED-09:00', 'WED-13:00', 'FRI-09:00'],
    n10000007: ['MON-09:00', 'TUE-13:00', 'WED-09:00', 'THU-13:00'],
    n10000008: ['MON-09:00', 'WED-09:00', 'THU-11:00', 'FRI-11:00'],
    n10000009: ['MON-09:00', 'TUE-09:00', 'WED-13:00', 'FRI-09:00'],
    n10000010: ['MON-09:00', 'MON-11:00', 'WED-09:00', 'FRI-13:00'],
  };

  for (const s of students) {
    const hash = bcrypt.hashSync('password123', 10);
    const teamupId = `TU-${uuidv4.v4().slice(0, 6).toUpperCase()}`;
    await conn.query(
      `INSERT IGNORE INTO students (student_id, teamup_id, name, email, password, is_new, cohort, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, teamupId, s.name, s.email, hash, s.is_new, s.cohort, s.is_admin]
    );
    await conn.query('DELETE FROM availability WHERE student_id = ?', [s.id]);
    for (const slot of availability[s.id]) {
      await conn.query('INSERT INTO availability (student_id, slot) VALUES (?, ?)', [s.id, slot]);
    }
  }
  
  //Admin seeding
  for(const a of admins) {
    const hash = bcrypt.hashSync('password123', 10);
    const teamupId = `TU-${uuidv4.v4().slice(0, 6).toUpperCase()}`;
    await conn.query(
      `INSERT IGNORE INTO students (student_id, teamup_id, name, email, password, is_new, cohort, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [a.id, teamupId, a.name, a.email, hash, a.is_new, a.cohort, a.is_admin]
    );
  }
  console.log('✓ Database and tables created');
  console.log('✓ 10 students seeded');
  await conn.end();
  rl.close();
  console.log('\n✅ Setup complete — run: npm run dev\n'); 
}

setup().catch(err => {
  console.error('Setup error:', err.message);
  rl.close();
  process.exit(1);
});