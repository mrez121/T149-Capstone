# Student Directory large-data verification

Date: 2026-09-09 (Australia/Brisbane)

Tester: Weiyi Lu, with automated verification assisted by Codex.
Baseline: main `00645f7`. Branch: `wl/directory-large-data-verification`.

## Changes

- Resolve numeric enrolment foreign keys through `units.id`; display the course
  code and return the internal ID separately.
- Return the nested public profile fields expected by the updated Profile page.
  Preserve its existing `prefferedName` spelling and fall back to the student's
  name when a preferred name is missing or blank.
- Fetch profile details only for the requested page, preserving the legacy
  parameterless profile lookup. Add regression coverage for both contracts.

HY's group-management code/tests, the generator, `.env.local` and the original
application database were not changed by this follow-up.

## Environment and safety

Node.js 24.15.0, Next.js 16.2.7, MySQL 8.0, Chrome and Playwright.
The preview runs on port 3001 against a separate MySQL instance on port 3310.

WARNING: `npm run lrgDataSeed` drops and recreates the hardcoded database named
`teamup` on its configured server. Changing only `MYSQL_DATABASE` does not
protect existing data. These checks used a separate server instance, not the
normal application database. Never run the generator on a shared or valuable
database without an appropriate backup and explicit reset agreement.

The unchanged generator created 264 accounts: 260 students and four admins.
Only the 250 generated students were enrolled in IFB398, with profiles and
tutorial availability. The ten fixed demo students were not enrolled, and no
groups were generated. The Directory correctly reports 250 classmates.
Local preview account: `n10000011`, demo password `password123`.

## Results

| Check | Result |
| --- | --- |
| Directory SQL regression suite | PASS: 14 cases plus parent, 15 reported |
| Existing automated group-management suite | PASS: 14 reported; unchanged |
| Production build | PASS |
| Real HTTP pagination | PASS: 10 pages of 25, exactly 250 unique classmates |
| Course/profile contract | PASS: IFB398, numeric ID and populated profile fields |
| Search | PASS: ID, TeamUp ID and email find a student beyond the first page |
| Combined filters | PASS: available/new/cohort/tutorial match the full dataset |
| Browser navigation | PASS: next/last pages and search resetting to page 1 |
| Page size | PASS: browser switches between 25 and 100 rows |
| Profile link | PASS: last-page preferred name and biography render from real data |
| Responsive Directory | PASS: 1440/768/390/320 pixels, no document overflow or identity/action overlap |
| Local invitation flow | PASS: create group, invite from Directory, accept as recipient |
| Counts/group filter | PASS: available 250 -> 249 -> 248; grouped filter returns both members |
| Fixed unenrolled demo account | PASS: clear 400 not-enrolled Directory response |
| Browser JavaScript errors | None in the checked Directory/profile workflow |

The invitation check used two generated students sharing a tutorial. It created
one temporary group, verified its invite and membership, then deleted only that
group. Cascading cleanup of its invite and memberships was verified. No email
delivery was tested or claimed.

Screenshots were inspected at all four widths. Machine-local evidence is in
`teamup-prototype/output/student-directory-large/`: `verification.json`,
`directory-live-<width>.png` and `profile-live.png`. Database files and screenshots
are not part of the source changes.

## Remaining scope

- The existing Edit Profile button targets `/students/<teamupId>/edit`, which
  returned 404 in a live check. Reading profiles works; editing remains for the
  profile feature owner to implement.
- The Directory uses the student's first enrolled unit; no multi-unit selector
  was added. Legacy profile lookup still fetches the full same-unit list.
- Real invitation acceptance was checked in IFB398, not every course or
  constraint combination. This is not certification of all admin/group features.
- These are functional regression checks with 250 generated students, not
  concurrent load testing, production verification or human user testing.
