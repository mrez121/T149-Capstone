/**
 * pages/tutor_dash.js Test Results
 * Copy template for UNIT and FUNCTIONAL testing as needed
 */

/**
 * @function adminDashboard
 * 
 * Test Criteria:
 * Do all nested functions activate correctly on this page?
 * Is HTML construction on this page correct?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/24 19:36
 * Test results: FAIL
 * Manual source code inspection was completed.
 * The dashboard JSX structure and navigation links were correct.
 * showToast and handleLogout were connected to the correct buttons.
 * However, adminDashboard does not check whether the user is logged in, or whether the user has an admin role before rendering the page.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/24 18:44
 * Test results: PASS
 * GET /tutor_dash 200 in 15ms (next.js: 3ms, application-code: 11ms)
 * The Admin Dashboard loaded successfully.
 * All four dashboard cards were displayed correctly.
 * View Units, Create Unit and View Enrolments links were visible.
 * Nested functions will be tested separately below.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 11/10/26 14:12
 * Test results: PASS
 * GET /tutor_dash 200 in 80ms (next.js: 51ms, application-code: 29ms)
 * Admin dashboard loaded successfully, all elements rendered correctly.
 */

/**
 * @function showToast
 * 
 * Test Criteria:
 * Does the toast activate properly when called?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/24 19:42
 * Test results: PASS
 * Manual source code inspection was completed.
 * showToast stores the provided message and type in the toast state.
 * The default toast type is success.
 * The toast state is cleared automatically after 4500 milliseconds.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/24 20:00
 * Test results: PASS
 * The toast appeared after clicking View All Groups.
 * The message was "View All Groups is still in development."
 * The toast disappeared automatically after approximately 4.5 seconds.
 * No browser errors were detected.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Test results: NOT RUN
 * Toasts are no longer used on this page as of 11/10/26
 */

/**
 * @function handleLogout
 * 
 * Test Criteria:
 * Is the user signed out from the page correctly?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/24 20:33
 * Test results: PASS
 * Manual source code inspection was completed.
 * handleLogout sends a POST request to /api/auth/logout.
 * The function waits for the logout request to complete.
 * The user is then redirected to the login page.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/24 20:39
 * Test results: PASS
 *  POST /api/auth/logout 200 in 6ms (next.js: 3ms, application-code: 4ms)
 * The user was signed out successfully.
 * The user was redirected to the login page.
 * The Sign in button was displayed correctly.
 * No browser errors were detected.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 11/10/26 14:15
 * Test results: PASS
 * POST /api/auth/logout 200 in 3ms (next.js: 1.1ms, application-code: 2ms)
 * User was signed out and redirected to login page successfully.
 */
