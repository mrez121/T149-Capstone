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
 */
