# TeamUp v4 — Next.js + MySQL

Constraint-based student team formation system.
IFB398 Capstone · QUT Technology For Teaching · Team 149

## Requirements
- Node.js (download from nodejs.org)
- MySQL 8 (download from dev.mysql.com/downloads/mysql)
  - Username: root
  - Password: rootpassword
  - Port: 3306

## Setup
1. Clone the repo
   git clone https://github.com/mrez121/T149-Capstone.git
   cd T149-Capstone

2. Install dependencies
   npm install

3. Create database and seed students
   npm run seed

4. Run the app
   npm run dev

5. Open browser at http://localhost:3000

## Demo login accounts
Password for all: password123

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

## Constraints enforced
1. Team size: 4-5 members
2. Max 2 new QUT students per group
3. All members must share at least 1 tutorial slot

## How it works
1. Students discuss and agree on a group outside the system
2. One student creates a group (Public or Private)
3. Creator invites teammates by their student ID
4. Invited students accept or decline from their dashboard
5. Constraint panel updates live as members join
6. Creator locks the group once all constraints are green
