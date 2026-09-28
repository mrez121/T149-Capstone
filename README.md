# TeamUp — Student Team Formation System
IFB398 Capstone · QUT Technology For Teaching · Team 149

## Requirements
- Node.js — download from nodejs.org
- MySQL 8 — download from dev.mysql.com/downloads/mysql
  - During MySQL install, set a root password and remember it

## Setup (run these commands in order)

1. Clone the repo
   git clone https://github.com/mrez121/T149-Capstone.git

2. Go into the folder
   cd T149-Capstone

3. Install packages
   npm install

4. Run setup (creates database and seeds students)
   npm run setup
   npm run lrgDataSeed
   
   When prompted:
   - MySQL host: Click Enter (localhost) - LEAVE EMPTY AND JUST CLICK ENTER
   - MySQL port: press Enter (3306) - LEAVE EMPTY AND JUST CLICK ENTER
   - MySQL username: press Enter (root) - LEAVE EMPTY AND JUST CLICK ENTER
   - MySQL password: type your MySQL password - PUT IN YOUR MYSQL PASSWORD

5. Start the app
   npm run dev

6. Open your browser at http://localhost:3000

## Demo login accounts
Password for all accounts: password123

n10000001 - Alice Chen      (Returning)
n10000002 - Ben Nguyen      (Returning)
n10000003 - Clara Smith     (Returning)
n10000004 - Daniel Park     (NEW)
n10000005 - Eva Martinez    (NEW)
n10000006 - Frank Li        (Returning)
n10000007 - Grace Kim       (Returning)
n10000008 - Henry Wilson    (NEW)
n10000009 - Isabella Jones  (Returning)
n10000010 - James Brown     (Returning)

bfarnsworth - Brandon Farnsworth (Admin)
wlu - Weiyi Lu (Admin)
mrezwani - Mehdi Rezwani (Admin)
hwang - Hongyun Wang (Admin)

250 random students are also generated to populate the database.

## How the system works
1. Students discuss and agree on a group outside the system
2. One student creates a group (Public or Private)
3. Creator invites teammates by entering their TeamUp ID (`TU-XXXXXX`)
4. Invited students see a notification on their dashboard to accept or decline
5. Constraint panel updates live as members join
6. Creator locks the group once all 3 constraints are green

For step-by-step student and administrator instructions, see
[USER_GUIDE.md](USER_GUIDE.md).

## Constraints enforced
1. Team size: 4-5 members
2. Max 2 new QUT students per group  
3. All members must share at least 1 common tutorial slot

## Resetting the database
To wipe all groups and start fresh, run in MySQL Workbench:
   USE teamup;
   DELETE FROM invites WHERE id > 0;
   DELETE FROM group_members WHERE id > 0;
   DELETE FROM `groups` WHERE id > 0;

## JSDOCS install for testing
1. Install JSDocs globally on your system:
   npm install -g jsdoc
2. Change into the root folder if not already there:
   cd T149-Capstone
3. After editing any of the JSDocs comments, run the following command to regenerate the documentation
   jsdoc -c docConfig.json
4. After editing any of the Testing documents to document results, run the following command to regenerate test documentation
   jsdoc -c testingDocConfig.json
