# Student Directory regression tests

Run `npm run test:directory` from the project root with Node.js 20 or later.
The tests use the MySQL connection settings from `.env.local`. The database user
needs permission to create and drop a temporary test database.

The suite creates a uniquely named `teamup_directory_test_<pid>_<timestamp>`
database and removes it in `finally`. Application tables, enrolments and invites
are not changed. It loads the real directory handler and session functions;
only the database connection is replaced with the isolated test connection.

Coverage includes:

- Authentication and GET-only access.
- 25-row default pages and 10/25/50/100-row page sizes.
- Unit isolation, admin exclusion and duplicate enrolment/availability rows.
- Stable ordering across pages, including students with equal names.
- Combined search, group status, student type, cohort and tutorial filters.
- Literal search characters, invalid parameters, empty results and page bounds.
- Unit-wide counts/filter options alongside filtered result totals.
- Compatibility with the parameterless API used by Student Profile.
- Missing enrolments and exclusion of private database fields.

## Verification on 2026-09-08

Tester: Weiyi Lu (automated verification assisted by Codex).

- `npm run test:directory`: PASS, 12 cases plus the parent test (13 reported).
  The fixture contains 63 classmates plus students in another unit and an admin.
- Next.js production build: PASS.
- Live browser check: demo student login and directory loading succeeded with
  five local classmates. View Profile opened the selected student's profile.
- Browser interaction checks with 63 simulated students: PASS for next/previous
  boundaries, first/last page, page jump, page size, combined filters, search
  resetting to page 1, clearing filters and expanding tutorial availability.
- Invitation UI: PASS for request payload, sent feedback, server validation
  errors and network failure recovery. These requests were mocked; no actual
  invitations were sent during this check.
- Directory/group error and retry states: PASS with simulated failures.
- Responsive browser checks: PASS at widths 1440, 768, 390 and 320 pixels, with
  screenshots inspected and no document overflow or student/action overlap.

The browser fixtures verify UI behavior, not backend invitation validation.
These checks do not claim production-scale load testing or human user testing.
The legacy parameterless profile lookup still returns the full same-unit list;
the updated directory itself always requests a bounded page from the API.
