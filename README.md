# TeamUp v4 — Next.js + MySQL

Constraint-based student team formation system.
IFB398 Capstone · QUT Technology For Teaching · Team 149

## Stack
- Next.js 14 · MySQL 8 · bcryptjs · jsonwebtoken

## Setup
```bash
npm install
npm run seed
npm run dev
```
Open: http://localhost:3000

## How grouping works

1. Students discuss and agree on a group outside the system
2. One student creates a group (Public or Private)
3. Creator invites teammates by entering their student ID
4. Invited students see a pending invite on their dashboard — accept or decline
5. As members join, the constraint status panel updates live
6. Once all 3 constraints are green, the creator locks the group

## Constraints
- 4–5 members per group
- Max 2 new QUT students per group
- All members must share at least 1 tutorial slot

## Public vs Private
- Public: visible in the group browser — any student can request to join
- Private: invite only — creator must invite each student by ID

## Demo accounts — password: password123
n10000001 Alice Chen      (Returning)
n10000002 Ben Nguyen      (Returning)
n10000003 Clara Smith     (Returning)
n10000004 Daniel Park     (NEW)
n10000005 Eva Martinez    (NEW)
n10000006 Frank Li        (Returning)
n10000007 Grace Kim       (Returning)
n10000008 Henry Wilson    (NEW)
n10000009 Isabella Jones  (Returning)
n10000010 James Brown     (Returning)

## Database (.env.local)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=rootpassword
MYSQL_DATABASE=teamup
