# Group Management regression tests

## Run

Use Node.js 20 or later and the MySQL connection settings in `.env.local`.
The database user needs permission to create and drop a temporary database.
Run from the project root:

```sh
node --experimental-vm-modules --test testing/automated/group-management.test.cjs
```

The suite creates its own `teamup_groups_test_<pid>_<timestamp>` database and
removes it after testing. It exercises the real API handler, authentication
and SQL without changing the application's data.

## Coverage

- Admin access, invalid parameters and database error recovery.
- Group member details and counts, including empty and small preference groups.
- Course isolation and exclusion of private student fields.
- Status/size filters before pagination, page sizes and out-of-range pages.
- Complete member lists across 100 groups and 500 students.
- Member count updates and unlock behavior, including the last filtered page.

## Verification — 2026-09-09

- Automated tests: PASS, 13 cases plus the parent test (14 reported).
- `npm run build`: PASS.
- Local browser checks: PASS for member expansion, combined filters, pagination,
  empty results, unlock updates, retry after authentication failure and keyboard
  controls. Responsive layouts were checked at widths 390 and 320 pixels.

The large fixture checks correctness, not production load performance.
