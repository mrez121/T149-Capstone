/**
 * pages/admin/units/enrolments
 * Copy template for UNIT and FUNCTIONAL testing as needed
 */

/**
 * @function enrolmentsPage
 * 
 * Test Criteria:
 * Do all nested functions activate correctly on this page?
 * Is HTML construction on this page correct?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:23
 * Test results: PASS
 * Manual source code inspection was completed.
 * enrolmentsPage declares state for all units, selected enrolments, loading
 * and toast feedback.
 * The page renders either an empty unit state or a card for each unit.
 * Enrolment results are shown only after getEnrolments updates enrolments state.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:23
 * Test results: PASS
 * Logged in as hwang with password123.
 * GET /admin/units/enrolments returned 200.
 * The Enrolments page loaded successfully for an admin account.
 * The local test database currently contains 0 units, so the no-units state is expected.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 14:16
 * Test results:
 */

/**
 * @function loadUnits
 * 
 * Test Criteria:
 * Are the correct units loaded from the database onto the page?
 * Are errors thrown correctly?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:23
 * Test results: PASS
 * Manual source code inspection was completed.
 * loadUnits fetches /api/admin/units/enrolments_units on page load.
 * A 401 or 403 response redirects the user away from the page.
 * Successful responses update allUnits and end the loading state.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:23
 * Test results: PASS
 * GET /api/admin/units/enrolments_units returned 200 for the admin session.
 * The API returned 0 units in the current local test database.
 * The page handled the empty units result without server errors.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 14:16
 * Test results:
 *  GET /admin/units/enrolments 200 in 121ms (next.js: 81ms, application-code: 40ms)
    GET /api/admin/units/enrolments_units 304 in 12ms (next.js: 5ms, application-code: 7ms)
    Units are retrieved from the database correctly.
    
    GET /admin/units/enrolments 200 in 19ms (next.js: 6ms, application-code: 13ms)
    GET /api/admin/units/enrolments_units 401 in 6ms (next.js: 1.9ms, application-code: 4ms)
    A 401 response from the API (not logged in) redirects the user back to the login page.

    GET /admin/units/enrolments 304 in 23ms (next.js: 7ms, application-code: 16ms)
    GET /api/admin/units/enrolments_units 403 in 6ms (next.js: 2ms, application-code: 4ms)
    A 403 response from the API (logged in, but not an admin user) redirects the user back to the login page.

 */

/**
 * @function showToast
 * 
 * Test Criteria:
 * Does the toast activate properly when called?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:23
 * Test results: PASS
 * Manual source code inspection was completed.
 * showToast stores the provided message and type in toast state.
 * The default toast type is success.
 * The toast state is cleared automatically after 4500 milliseconds.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:23
 * Test results: NOT RUN
 * Toast display depends on selecting a unit and fetching its enrolments.
 * The current local test database contains 0 units, so there was no unit
 * button available to trigger this flow.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 14:17
 * Test results: PASS
 * A notification stating `IFB398 enrolments fetched` appears when the enrolments is clicked.
 */

/**
 * @function getEnrolments
 * 
 * Test Criteria:
 * Does the unit code get passed to the URL correctly?
 * Does the function get the necessary data from the API correctly?
 * Are errors thrown correctly?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:23
 * Test results: PASS
 * Manual source code inspection was completed.
 * getEnrolments passes the selected unit code through the unit query parameter.
 * Successful API responses show a success toast and update enrolments state.
 * Failed API responses show the returned error message in an error toast.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:23
 * Test results: NOT RUN
 * No specific unit enrolment request was run because the local test database
 * currently contains 0 units.
 * A controlled test can be completed after a test unit and enrolment data are added.
 * 
 * FUNCTIONAL TEST #2
 * Tester name: Brandon Farnsworth
 * Date and time: 13/10/26 14:17
 * Test results: PASS
 * GET /api/admin/units/enrolments_students?unit=1 201 in 29ms (next.js: 17ms, application-code: 12ms)
 * 251 enrolment records returned in the Enrolments Results list, matching what is in the database.
 * GET /api/admin/units/enrolments_students?unit=3 201 in 13ms (next.js: 3ms, application-code: 10ms)
 * 0 enrolment records returned. Unique graphic displayed to show no students are enrolled.
 */

/**
 * @function handleLogout
 * 
 * Test Criteria:
 * Is the user signed out of the page correctly?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:23
 * Test results: PASS
 * Manual source code inspection was completed.
 * handleLogout sends a POST request to /api/auth/logout and then redirects
 * the admin user to the login page.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:23
 * Test results: NOT RUN
 * Logout was not clicked during this pass because the test focused on page
 * loading and enrolments data retrieval.
 * The logout API is covered separately in auth/logout testing.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 14:18
 * Test results: PASS
 * POST /api/auth/logout 200 in 65ms (next.js: 48ms, application-code: 17ms)
    Authenticated admin user logged out successfully.
 */
