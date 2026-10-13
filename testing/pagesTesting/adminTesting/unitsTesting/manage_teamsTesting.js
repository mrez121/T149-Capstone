/**
 * pages/admin/units/manage_teams.js Tests
 */

/**
 * @function ManageTeamsPage
 * Test criteria:
 * Does the page render correctly?
 * Are all functions on this page working correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 17:56
 * Test results:
 *  GET /admin/units/manage_teams 304 in 118ms (next.js: 93ms, application-code: 24ms)
    GET /api/admin/units 304 in 7ms (next.js: 1.4ms, application-code: 6ms)
    Page renders correctly with an authenticated admin user.

    GET /admin/units/manage_teams 304 in 26ms (next.js: 10ms, application-code: 16ms)
    GET /api/admin/units 403 in 6ms (next.js: 1.9ms, application-code: 4ms)
    A non-admin user gets a 403 response and gets redirected to login page.

    GET /admin/units/manage_teams 304 in 22ms (next.js: 8ms, application-code: 14ms)
    GET /api/admin/units 401 in 7ms (next.js: 3ms, application-code: 4ms)
    A unauthenticated user gets a 401 response and redirected to login page.

 */

/**
 * @function loadUnits
 * Test criteria:
 * Does the function fetch data correctly?
 * Are errors handled correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 17:59
 * Test results:
 *  GET /api/admin/units 200 in 24ms (next.js: 7ms, application-code: 18ms)
    GET /api/admin/units 200 in 33ms (next.js: 14ms, application-code: 19ms)
    Admin user can see correct data from database.
    See above for non-admin user responses.
 */

/**
 * @function showToast
 * Test criteria:
 * Does the function display messages correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 18:01
 * Test results: PASS
 * Clicking a {unit} teams button displays a notification on successful fetch.
 */

/**
 * @function handleLogout
 * Test criteria:
 * Does the function log the user out correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 17:56
 * Test results:
 * POST /api/auth/logout 200 in 6ms (next.js: 2ms, application-code: 3ms)
    User logged out successfully using this function.
 */

/**
 * @function getTeams
 * Test criteria:
 * Does the function fetch data correctly?
 * Are errors handled correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 18:02
 * Test results: PASS
 *  GET /api/admin/units/teams?unit=1&size=all&page=1&pageSize=25 200 in 10ms (next.js: 2ms, application-code: 7ms)
    GET /api/admin/units/teams?unit=1&size=all&page=1&pageSize=100 200 in 6ms (next.js: 1.7ms, application-code: 4ms)
    GET /api/admin/units/teams?unit=1&size=all&page=1&pageSize=10 200 in 8ms (next.js: 3ms, application-code: 6ms)
    Data is fetched correctly getting teams. Team data on page reflects team data in database.
 */

/**
 * @function deleteTeam
 * Test criteria:
 * Does a confirmation window appear allowing the user to cancel the operation?
 * Does the function submit to the database correctly?
 * Are errors handled correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 18:04
 * Test results: PASS
 * Confirmation window appears when clicking on Delete {team name} button.
 * Clicking cancel stops the operation.
 *  DELETE /api/admin/units/teams?team=T150&name=Super%20Ultra%20TeamUp%20Hyper%20Edition%20Ex&unit=1 200 in 13ms (next.js: 1.9ms, application-code: 11ms)
    GET /api/admin/units 200 in 19ms (next.js: 8ms, application-code: 11ms)
    GET /api/admin/units/teams?unit=1&size=all&page=1&pageSize=25 200 in 12ms (next.js: 4ms, application-code: 7ms)
    Deleting a team removes it from the page and updates the database correctly. Database contents are then
    fetched to update the page with newest information.
 */