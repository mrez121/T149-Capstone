/**
 * pages/api/admin/units/groups.js Test results
 * Copy templates for UNIT and FUNCTIONAL testing as needed.
 */

/**
 * @function handler
 *
 * Test Criteria:
 * 01. Does the function correctly check that the current user is logged in and is an admin?
 * 02. Does the function return an authentication error for non-admin users?
 *
 * 03. GET method - does the handler correctly identify the HTTP method as GET?
 * 04. GET method - does the function correctly determine which unit is being requested?
 * 05. GET method - does the function return groups from the requested unit only?
 * 06. GET method - is the correct response code sent for success?
 * 07. GET method - is the correct data sent back to the calling page?
 *
 * 08. POST method - does the handler correctly identify the HTTP method as POST?
 * 09. POST method - does the function correctly determine which group is being updated?
 * 10. POST method - does the function return 404 when the group does not exist?
 * 11. POST method - does the function return 400 when the group is already unlocked?
 * 12. POST method - does the function update a locked group to forming?
 * 13. POST method - is the correct response code sent for success and errors?
 * 14. POST method - is the correct data sent back to the calling page?
 *
 * 15. Unsupported method - does the handler return 405 for unsupported methods?
 *
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/27 15:57
 * Test results: PASS
 * Manual source code inspection was completed.
 * The handler checks requireAuth and returns a 403 response when the current
 * user is missing or is not an admin.
 * GET parses req.query.unit as an integer and selects group_id, name, status
 * and created_by from groups where unit_id matches the requested unit.
 * POST reads req.query.groupId, checks that the group exists, checks that the
 * group is currently locked, and updates the group status to forming.
 * Unsupported methods return 405.
 *
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/27 15:57
 * Test results: PASS
 * Logged in with the hwang admin account.
 * A local test unit, IFB398, and locked test group, G-WLTEST, were used for
 * this test pass.
 * GET /api/admin/units/groups?unit=1 returned 200 and returned G-WLTEST with
 * status locked.
 * POST /api/admin/units/groups?groupId=G-WLTEST returned 200 with {ok: true}.
 * Database inspection confirmed that G-WLTEST changed to status forming.
 * A second POST request to the same group returned 400 with the message
 * "WL Test Group is already unlocked.", which matches the expected error path.
 */
