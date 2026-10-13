/**
 * pages/api/admin/units/[id]/teams/[teamId]js Tests
 */

/**
 * @function EditTeamPage
 * Test Criteria:
 * Does the page render correctly?
 * Do all the functions on this page work correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 16:41
 * Test results: FAIL
 *  GET /admin/units/1/teams/T149?name=TeamUp 304 in 40ms (next.js: 16ms, application-code: 23ms)
    GET /api/admin/units/teams_team?teamId=T149&unit=1 304 in 29ms (next.js: 15ms, application-code: 14ms)
    Page displays correctly for a valid team

    GET /admin/units/1/teams/T149?name=dgksgbka 200 in 27ms (next.js: 10ms, application-code: 17ms)
    GET /api/admin/units/teams_team?teamId=T149&unit=1 304 in 10ms (next.js: 1.4ms, application-code: 9ms)
    Invalid team name in URL renders page correctly and fetches stored team from session.

    BUG FIXED 13/10 by Brandon Farnsworth
    Added the loadTeamData function and removed the team name parameter from url to change structure.
    This prevents an invalid Team ID from being used. An invalid Team ID in the url now redirects the user back
    to the manage teams page.

    POST FIX Test results:
    GET /api/admin/units/teams_team?teamId=T150&unit=1 200 in 38ms (next.js: 20ms, application-code: 17ms)
    Valid team page renders correctly.

    GET /api/admin/units/teams_team?teamId=ngzsnkjs&unit=1 404 in 10ms (next.js: 4ms, application-code: 6ms)
    Invalid Team ID returns correct 404 code and redirects user.
*/

/**
 * @function loadTeamData
 * Test criteria:
 * Does the function fetch correct data?
 * Does the function handle errors correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 17:06
 * Test results: PASS
 * Data is fetched correctly, errors are handled correctly. An incorrect team ID redirects the user back to the manage teams page.
 */

/**
 * @function handleChange
 * test criteria:
 * Does the function handle input changes correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 17:07
 * Test results: PASS
 * Editing the name input field updates the form correctly. Team ID field is inaccessible.
 */

/**
 * @function showToast
 * Test criteria:
 * Does the function display messages correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 17:09
 * Test results: PASS
 * Submitting the form displays a notification that says "Team updated successfully."
 * Submitting an invalid team name displays an error notification that says "Invalid Team Name."
 */

/**
 * @function handleSubmit
 * Test criteria:
 * Does the function submit data to the database correctly?
 * Are errors handled correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 17:09
 * Test results: PASS
 *  POST /api/admin/units/teams_team 200 in 13ms (next.js: 2ms, application-code: 10ms)
    Valid team name passed to form is updated in database correctly.

    POST /api/admin/units/teams_team 400 in 5ms (next.js: 1.7ms, application-code: 3ms)
    Invalid team name returns correct 400 response and displays an error notification.
 */