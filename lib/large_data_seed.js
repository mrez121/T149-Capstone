// lib/large_data_seed.js
// script to create a large data set of students for use in testing
import * as mysql from 'mysql2/promise';
import * as uuidv4 from 'uuid';
import bcrypt from 'bcryptjs';
import { faker, fakerEN_AU_ocker } from '@faker-js/faker';

// need to use --env-file=.env.local when running this script to have this config work
const config = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
}

// Static data from previous versions are included here alongside additional randomised data
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

// Timeslot tutorials for adding random availabilities
const timeslots = [
    'MON-09:00', 'MON-10:00', 'MON-11:00', 'MON-12:00', 'MON-13:00', 'MON-14:00', 'MON-15:00', 'MON-16:00',
    'TUE-09:00', 'TUE-10:00', 'TUE-11:00', 'TUE-12:00', 'TUE-13:00', 'TUE-14:00', 'TUE-15:00', 'TUE-16:00',
    'WED-09:00', 'WED-10:00', 'WED-11:00', 'WED-12:00', 'WED-13:00', 'WED-14:00', 'WED-15:00', 'WED-16:00',
    'THU-09:00', 'THU-10:00', 'THU-11:00', 'THU-12:00', 'THU-13:00', 'THU-14:00', 'THU-15:00', 'THU-16:00',
    'FRI-09:00', 'FRI-10:00', 'FRI-11:00', 'FRI-12:00', 'FRI-13:00', 'FRI-14:00', 'FRI-15:00', 'FRI-16:00',
]

/**
 * Generate sample students
 */
async function generateStudents(count) {
    //arrays for student profile construction
    const contactMethodOptions = ['phone', 'email', 'Discord', 'Instagram'];
    const fakerModules = ['music', 'book', 'animal', 'food'];

    const users = await Promise.all(
        Array.from({length: count}, async (v, i) => {
            //RNG values
            const cMNumber = faker.number.int({min: 0, max: 3});
            const fMNumber = faker.number.int({min: 0, max: 3});
            const numAvailSlots = faker.number.int({min: 1, max: 40});
            
            //students table entries
            const studentId = `n${10000011 + i}`;
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const email = `${firstName}.${lastName}@student.qut.edu.au`;
            const hash = bcrypt.hashSync('password123', 10);
            const teamupId = `TU-${uuidv4.v4().slice(0, 10).toUpperCase()}`;
            const isNew = faker.number.int({min: 0, max: 1});
            const cohort = faker.number.int({min: 2016, max: 2024});
            const isAdmin = 0;
         
            //student profile entries
            const bio = faker.person.bio();
            const skills = faker.lorem.sentences();
            const remoteStudent = faker.number.int({min: 0, max: 1});
            const contactMethod = contactMethodOptions[cMNumber];
            let contactHandle = '';
            if(contactMethod === 'phone') {
                contactHandle = fakerEN_AU_ocker.phone.number();
            }
            if(contactMethod === 'email') {
                contactHandle = faker.internet.exampleEmail({firstName: firstName});
            }
            if(contactMethod === 'Discord' || contactMethod === 'Instagram') {
                contactHandle = faker.internet.username();
            }
            let interests = '';
            const interestCategory = fakerModules[fMNumber];
            if(interestCategory === 'music') {
                interests = faker.music.artist();
            }
            if(interestCategory === 'book') {
                interests = faker.book.title();
            }
            if(interestCategory === 'animal') {
                interests = faker.animal.type();
            }
            if(interestCategory === 'food') {
                interests = faker.food.dish();
            }

            //student availability entries
            let slots = [];
            for(let j = 0; j < numAvailSlots; j++) {
                const rng = faker.number.int({min: 0, max: 39});
                const timeslot = timeslots[rng];
                slots.push(timeslot);
            }

            return {
                student_id: studentId,
                teamup_id: teamupId,
                name: `${firstName} ${lastName}`,
                email: email,
                password: hash,
                is_new: isNew,
                cohort: cohort,
                is_admin: isAdmin,
                preferred_name: firstName,
                bio: bio,
                skills: skills,
                interests: interests,
                contact_method: contactMethod,
                contact_handle: contactHandle,
                remote_student: remoteStudent,
                slots: slots,
            };
        }),
    );

    return users;
}


async function seed() {
    
    // test connection to database
    try {
        const testConn = await mysql.createConnection(config);
        await testConn.end();
        console.log('MySQL connection successful');
    } catch(err) {
        console.error('Could not connect to MySQL: ', err.message);
        console.log('Ensure that you have configured .env.local correctly');
        console.log('Ensure that you run this script with --env-file=.env.local flag');
        process.exit(1);
    }
    
    // Seed database
    try {
        const conn = await mysql.createConnection(config);
        
        console.log('Deleting old data from TeamUp...');
        await conn.query('DROP DATABASE IF EXISTS teamup');
        
        console.log('Creating new TeamUp database...')
        await conn.query('CREATE DATABASE IF NOT EXISTS teamup');
        await conn.query('USE teamup');
        console.log('Database created');

        /**
         * students table
         * stores the users of teamup, both students and admins.
         * student_id - QUT system username (e.g., n10000001)
         * teamup_id - an autogenerated uuid
         * is_admin flag: 0 = student user, 1 = admin user
         */
        console.log('Creating students table...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS students (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            student_id  VARCHAR(20) UNIQUE NOT NULL,
            teamup_id   VARCHAR(20) UNIQUE NOT NULL,
            name        VARCHAR(100) NOT NULL,
            email       VARCHAR(100) UNIQUE NOT NULL,
            password    VARCHAR(255) NOT NULL,
            is_new      TINYINT DEFAULT 0,
            cohort      VARCHAR(10) NOT NULL,
            is_admin    TINYINT DEFAULT 0
            )`
        );
        console.log('students table created');

        /**
         * units table
         * stores the units created by administrator users
         * unit_code - must be unique code (e.g. IFB399)
         * created_by - must reference a student_id where is_admin = 1
         * Each unit has its own group formation context
         */
        console.log('Creating units table...');
        await conn.query(
            `CREATE TABLE IF NOT EXISTS units(
            id          INT AUTO_INCREMENT PRIMARY KEY,
            unit_code   VARCHAR(20) UNIQUE NOT NULL,
            unit_name   VARCHAR(100) NOT NULL,
            semester    VARCHAR(20) NOT NULL,
            created_by  VARCHAR(20) NOT NULL,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES students(student_id) 
            )`
        );
        console.log('units table created');

        /**
         * unit_constraints table
         * stores the constraints for group and team formation (e.g., min and max size)
         */
        console.log('Creating unit_constraints table...');
        await conn.query(
            `CREATE TABLE IF NOT EXISTS unit_constraints(
            id        INT AUTO_INCREMENT PRIMARY KEY,
            unit_id   INT NOT NULL,
            min_size  INT DEFAULT 4,
            max_size  INT DEFAULT 5,
            max_new   INT DEFAULT 2,
            FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
            )`
        );
        console.log('unit_constraints table created');

        /**
         * unit_enrolments table
         * links students to units
         */
        console.log('Creating unit_enrolments table...');
        await conn.query(
            `CREATE TABLE IF NOT EXISTS unit_enrolments(
            id          INT AUTO_INCREMENT PRIMARY KEY,
            unit_id     INT NOT NULL,
            student_id  VARCHAR(20) NOT NULL,
            UNIQUE KEY unique_enrolment (unit_id, student_id),
            FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
            )`
        );
        console.log('unit_enrolments table created');

        /**
         * groups table
         * stores the groups created by students within a each unit
         * group_id - autogenerated uuid
         * type - public or private group types
         * status - forming or locked types
         * created_by - the student that created the group (determines who can invite or lock the group)
         * unit_id - references the id value of a unit from the units table
         */
        console.log('Creating groups table');
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
            unit_id     INT DEFAULT NULL,
            FOREIGN KEY (created_by) REFERENCES students(student_id),
            FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
            )`
        );
        console.log('groups table created');

        /**
         * group_members table
         * stores the members of a group.
         */
        console.log('Creating group_members table...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS group_members (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            group_id   VARCHAR(20) NOT NULL,
            student_id VARCHAR(20) NOT NULL,
            joined_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_member (group_id, student_id),
            FOREIGN KEY (group_id)   REFERENCES \`groups\`(group_id) ON DELETE CASCADE,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
            )`
        );
        console.log('group_members table created');

        /**
         * invites table
         * stores the invites that a group creator can send to another student 
         * unique_invite - prevents a group creator from sending multiple invites to the same student
         */
        console.log('Creating invites table...')
        await conn.query(`
            CREATE TABLE IF NOT EXISTS invites (
            id              INT AUTO_INCREMENT PRIMARY KEY,
            group_id        VARCHAR(20) NOT NULL,
            from_student_id VARCHAR(20) NOT NULL,
            to_student_id   VARCHAR(20) NOT NULL,
            status          ENUM('pending','accepted','declined') DEFAULT 'pending',
            created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_invite (group_id, to_student_id),
            FOREIGN KEY (group_id)        REFERENCES \`groups\`(group_id) ON DELETE CASCADE,
            FOREIGN KEY (from_student_id) REFERENCES students(student_id) ON DELETE CASCADE,
            FOREIGN KEY (to_student_id)   REFERENCES students(student_id) ON DELETE CASCADE
            )`
        );
        console.log('invites table created');

        /**
         * timeslots table
         * stores the timeslots for unit tutorials/meetings
         */
        console.log('Creating timeslots table...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS timeslots (
            id INT AUTO_INCREMENT PRIMARY KEY,
            slot VARCHAR(20) UNIQUE NOT NULL,
            unit_id INT NOT NULL,
            FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
            )`
        );
        console.log('timeslots table created')

        /**
         * availability table
         * the list of timeslots that a student has indicated they are available for.
         */
        console.log('Creating availability table...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS availability (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            student_id VARCHAR(20) NOT NULL,
            slot       VARCHAR(20) NOT NULL,
            UNIQUE KEY unique_slot (student_id, slot),
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
            FOREIGN KEY (slot) REFERENCES timeslots(slot) ON DELETE CASCADE
            )`
        );
        console.log('availability table created');

        /**
         * student_profiles table
         * stores the profile information that a student adds to their profile
         */
        console.log('Creating student_profiles table...');
        await conn.query(
            `CREATE TABLE IF NOT EXISTS student_profiles(
            id              INT AUTO_INCREMENT PRIMARY KEY,
            student_id      VARCHAR(20) UNIQUE NOT NULL,
            preferred_name  VARCHAR(100),
            bio             TEXT,
            skills          VARCHAR(255),
            interests       VARCHAR(255),
            contact_method  VARCHAR(50),
            contact_handle  VARCHAR(100),
            remote_student  TINYINT DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id)
            )`
        );
        console.log('student_profiles table created');

        console.log('All database tables created!');

        console.log('Seeding static students...');
        for(const s of students) {
            const hash = bcrypt.hashSync('password123', 10);
            const teamupId = `TU-${uuidv4.v4().slice(0, 10).toUpperCase()}`;
            await conn.query(
                `INSERT IGNORE INTO students (student_id, teamup_id, name, email, password, is_new, cohort, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [s.id, teamupId, s.name, s.email, hash, s.is_new, s.cohort, s.is_admin]
            );
        }
        console.log('10 static students added to database');

        console.log('Seeding static admins...');
        for(const a of admins) {
            const hash = bcrypt.hashSync('password123', 10);
            const teamupId = `TU-${uuidv4.v4().slice(0, 10).toUpperCase()}`;
            await conn.query(
                `INSERT IGNORE INTO students (student_id, teamup_id, name, email, password, is_new, cohort, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [a.id, teamupId, a.name, a.email, hash, a.is_new, a.cohort, a.is_admin]
            );
        }
        console.log('4 static admins added to database');

        console.log('Generating a unit for student enrolments...');
        await conn.query(
            `INSERT IGNORE INTO units (unit_code, unit_name, semester, created_by) VALUES (?, ?, ?, ?)`,
            ['IFB398', 'Capstone Phase 1', 'Semester 2 2026', 'bfarnsworth']
        );
        console.log('Unit IFB398 added to database\nAdding constraints...');
        await conn.query(
            `INSERT IGNORE INTO unit_constraints (unit_id, min_size, max_size, max_new) VALUES (?, ?, ?, ?)`,
            [1, 4, 5, 2]
        );
        console.log("Constraints added to IFB398");

        console.log('Generating timeslots...');
        for(let i = 0; i < timeslots.length; i++) {
            await conn.query(
                `INSERT INTO timeslots (slot, unit_id) VALUES (?, ?)`,
                [timeslots[i], 1]
            );
        }
        console.log('40 timeslots added');

        console.log('Generating random students...');
        const users = await generateStudents(250);
        console.log();
        for(const u of users) {
            console.log(`Adding student ${u.student_id} to database...`);
            await conn.query(
                `INSERT IGNORE INTO students (student_id, teamup_id, name, email, password, is_new, cohort, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [u.student_id, u.teamup_id, u.name, u.email, u.password, u.is_new, u.cohort, u.is_admin]
            );
            console.log(`Adding ${u.student_id}'s profile to database...`);
            await conn.query(
                `INSERT IGNORE INTO student_profiles (student_id, preferred_name, bio, skills, interests, contact_method, contact_handle, remote_student) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [u.student_id, u.preferred_name, u.bio, u.skills, u.interests, u.contact_method, u.contact_handle, u.remote_student]
            );
            console.log(`Adding ${u.student_id}'s availability to database...`);
            for(let i = 0; i < u.slots.length; i++) {
                await conn.query(
                    `INSERT IGNORE INTO availability (student_id, slot) VALUES (?, ?)`,
                    [u.student_id, u.slots[i]]
                );
            }
            console.log(`Enrolling ${u.student_id} in IFB398...`);
            await conn.query(
                `INSERT IGNORE INTO unit_enrolments (unit_id, student_id) VALUES (?, ?)`,
                [1, u.student_id]
            );
            console.log(`Student ${u.student_id}: ${u.name} added to database!`);
        }

        await conn.end();

        console.log('250 random students added to database');
        console.log('Setup complete!\nUse:\n npm run dev\n to launch TeamUp');     

    } catch(err) {
        console.error("Error seeding database", err);
        process.exit(1);
    }
}

// Run the seed
seed();