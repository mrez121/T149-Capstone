/**
 * pages/admin/units/[id]/add-team.js Tests
 */

/**
 * @function AddTeamPage
 * Test criteria:
 * Does the page render correctly?
 * Do all functions work correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 16:19
 * Test results: PASS
 *  GET /admin/units/1/add-team?unitCode=IFB398 200 in 73ms (next.js: 58ms, application-code: 15ms)
    Page renders correctly for a valid unit.

    GET /admin/units/1/add-team?unitCode=sglskg 200 in 30ms (next.js: 6ms, application-code: 24ms)
    Page renders correctly for an invalid unit. Attempting to submit the form results in a "unit not found" error.

    All functions work correctly after fixes to handleSubmit
 */

/**
 * @function handleChange
 * Test criteria:
 * Does the page handle input field values correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 16:20
 * Test results: PASS
 * Form input fields are handled correctly and passed to submit function correctly. * 
 */

/**
 * @function showToast
 * Test criteria:
 * Does the page display notifications correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 16:21
 * Test results: PASS
 * Success and error notifications are displayed correctly when submitting form. * 
 */

/**
 * @function handleSubmit
 * Test criteria:
 * Does the function submit information to the database correctly?
 * Are errors handled correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 16:22
 * Test results: FAIL
 * 
*   ⨯ Error: Data too long for column 'team_id' at row 1
            at handler (pages\api\admin\units\teams.js:109:18)
        107 |
        108 |         // Attempt to add team to unit - team id must be unique, so an error will be retu...
        > 109 |         await db.query(
            |                  ^
        110 |             `INSERT INTO teams (team_id, name, unit_id, created_by) VALUES (?, ?, ?, ?)`,
        111 |             [team_id, name, unit, admin.studentId]
        112 |         ); {
        code: 'ER_DATA_TOO_LONG',
        errno: 1406,
        sqlState: '22001',
        sqlMessage: "Data too long for column 'team_id' at row 1",
        sql: "INSERT INTO teams (team_id, name, unit_id, created_by) VALUES ('knsdgnasglkregkjnbasdfnkasgnknagskjnasgbnfkjsbfkjbagjknagns;angnagkjnaskhgnsfghkafsdngkgbfkebrkgbasbgfkj;sdbgk;jbasg', 'sdfngdnsfgnsgkjnfhn;fnhdfsnhljksdnkjlnkgjnagnkgn;lfrednl;ngf', '1', 'bfarnsworth')",
        page: '/api/admin/units/teams'
        }
        POST /api/admin/units/teams?unit=1&unitCode=IFB398 500 in 368ms (next.js: 191ms, application-code: 176ms)
        [browser] ⨯ unhandledRejection: SyntaxError: JSON.parse: unexpected character at line 1 column 1 of the JSON data
    Submitting a Team ID or Team Name longer than the database type limit results in a server error and a frozen client page.
    
    BUG FIXED 13/10 by Brandon Farnsworth
 * 
 * POST /api/admin/units/teams?unit=1&unitCode=sglskg 404 in 6ms (next.js: 1.5ms, application-code: 5ms)
    Submitting valid team info to an invalid unit returns correct 404 response and presents unit not found error.

    POST FIX Test results:
    POST /api/admin/units/teams?unit=1&unitCode=IFB398 200 in 15ms (next.js: 3ms, application-code: 12ms)
    Valid team information is sent to database correctly. Database stores information correctly.
    Success notification displays correctly.

    POST /api/admin/units/teams?unit=1&unitCode=IFB398 400 in 24ms (next.js: 18ms, application-code: 6ms)
    POST /api/admin/units/teams?unit=1&unitCode=IFB398 400 in 6ms (next.js: 3ms, application-code: 3ms)
    Invalid Team IDs and Names are now rejected and an error is displayed on the page correctly.
 */