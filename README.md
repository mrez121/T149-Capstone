# TeamUp — Student Team Formation System
IFB399 Capstone · QUT Technology For Teaching · Team 149

## Developed by:
- Brandon Farnsworth - n9703420
- Hongyun Wang - n12554260
- Mehdi Rezwani - n11547511
- Weiyi Lu - n12554201

## Requirements (installers are recommended for Windows users)
- Node.js — download from [nodejs.org](https://nodejs.org/en/download)
- Git - download from [git-scm.com](https://git-scm.com/install/windows)
- MySQL 8 — download from [dev.mysql.com/downloads/mysql](https://dev.mysql.com/downloads/mysql/8.0.html)
- **During MySQL install, set a root password and remember it**

## Setup (run these commands in order in preferred CLI (Command prompt, Git Bash, etc.))

- **Do not close your CLI until all steps are completed.**

1. Clone the repo in the file directory of your choice (e.g. Documents)
   - `git clone https://github.com/mrez121/T149-Capstone.git`

2. Change into the project directory
   - `cd T149-Capstone`

3. Install all package dependencies
   - `npm install`

4. Run setup (creates database and seeds students)
   - `npm run setup`
   
   When prompted during the setup program, do the following:
   - `MySQL host: press Enter for 'localhost'`
   - `MySQL port: press Enter for '3306'`
   - `MySQL username: press Enter for 'root'`
   - `MySQL password: type in the password you set during your MySQL installation`

5. After confirmation that the setup has complete, run the following command to start the web server
   - `npm run dev`

6. With the local server running in the background, open your preferred browser and go to
   - `http://localhost:3000`

7. When you have finished using TeamUp, close your browser. Then, in the CLI where the web server is running:
   - press `CTRL+C` to close the server

## Demo login accounts
**Password for all accounts: password123**<br>

Administrator users:<br>
bfarnsworth<br>
hwang<br>
mrezwani<br>
wlu<br>
<br>
The following 10 students are always generated in the same way and are not initially enrolled in a unit.<br>
An admin user needs to enrol these students in a unit before they can access any TeamUp features.<br>

n10000001 - Alice Chen - teamup.student1@gmail.com<br>
n10000002 - Ben Nguyen - ben.nguyen@student.qut.edu.au<br>
n10000003 - Clara Smith - clara.smith@student.qut.edu.au<br>
n10000004 - Daniel Park - daniel.park@student.qut.edu.au<br>
n10000005 - Eva Martinez - eva.martinez@student.qut.edu.au<br>
n10000006 - Frank Li - frank.li@student.qut.edu.au<br>
n10000007 - Grace Kim - grace.kim@student.qut.edu.au<br>
n10000008 - Henry Wilson - henry.wilson@student.qut.edu.au<br>
n10000009 - Isabella Jones - isabella.jones@student.qut.edu.au<br>
n10000010 - James Brown - james.brown@student.qut.edu.au<br>

250 random students are also generated to populate the database.<br>
These random students are enrolled in IFB398.<br>
You can log in as them using any student number from *n10000011* to *n10000260* and using *password123* for password.<br>

## How the system works
### For student users
1. Students discuss and agree on a group outside the system
2. Students set-up their profile on TeamUp to ensure they have matching availability
3. One student creates a group (Public or Private)
4. Creator invites teammates by entering their TeamUp ID (`TU-XXXXXXXX-X`) or searching the student directory
5. Invited students see a notification on their dashboard to accept or decline
6. Constraint panel updates live as members join
7. Creator locks the group once all 3 constraints are green

### For administrator users
1. Create a unit and add tutorial timeslots.
2. Enrol students into a unit (note that students can only be enrolled in **1 unit**)
3. Create Teams in a unit that locked student groups can be assigned to.
4. Unlock groups at the request of students in the group.

For step-by-step student and administrator instructions, see
[USER_GUIDE.md](USER_GUIDE.md).

## Email notification system
n10000001 - Alice Chen has a unique email address that allows you to test the email notification system.<br>
When Alice is invited to a group, an email is sent to <teamup.student1@gmail.com><br>
You can use the following details to access the account and view the invite notifications yourself:<br>
- https://mail.google.com
- email address: teamup.student1@gmail.com
- password: TeamStudent.1@!<br>
**Do not add a passkey or change any account details.**<br>

TeamUp uses [Resend](https://resend.com/) for its email notification system.<br>
If you would prefer to use another email address for testing the notification system, create a Resend account and replace<br><br>
`RESEND_API_KEY` in .env.local<br><br>
with your Resend account API key. Then change any student email addresses to ones that your API key can send to in MySQL workbench using this command:<br><br>
`UPDATE students SET email = '{your_resend_valid_email}' WHERE student_id = '{student number}';`

## Default constraints enforced
1. Team size: 4-5 members
2. Max 2 new QUT students per group  
3. All members must share at least 1 common tutorial slot

## Resetting the database
To wipe all groups and start fresh:<br> 
- In MySQL workbench:
   - `DROP DATABASE teamup`
- Then in your preferred CLI:
   - Change into project folder directory
   - `npm run setup`

## JSDOCS install for testing
1. Install JSDocs globally on your system:
   - `npm install -g jsdoc`
2. Change into the root folder if not already there:
   - `cd T149-Capstone`
3. After editing any of the JSDocs comments, run the following command to regenerate the documentation
   - `jsdoc -c docConfig.json`
4. After editing any of the Testing documents to document results, run the following command to regenerate test documentation
   - `jsdoc -c testingDocConfig.json`
