/**
 * pages/index.js Test Results
 * Copy templates for UNIT and FUNCTIONAL testing as needed
 */

/**
 * @function LoginPage
 * 
 * Test Criteria:
 * Do all the nested functions activate correctly on this page?
 * Is HTML construction on this page correct?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 19:33
 * Test results: PASS
 * Manual source code inspection was completed.
 * The JSX constructs the login page with the correct title, student ID and password inputs, Sign in button and demo account information.
 * The form submit event is connected to handleLogin, and the input, error and loading states are rendered correctly.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 19:33
 * Test results: PASS
 * GET / 304 in 1086ms (next.js: 1025ms, application-code: 61ms)
 * The TeamUp login page loaded successfully at GET /.
 * The student ID field, password field, Sign in button and demo account information were displayed correctly.
 * The page title was "TeamUp — Login" and no browser errors were detected.
 */

/**
 * @function handleLogin
 * 
 * Test Criteria:
 * Does the login function pull the necessary data?
 * Does the function redirect the user to the correct page based on their admin status?
 * Does the function throw appropriate errors if login is incorrect?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 19:40
 * Test results: PASS
 * Manual source code inspection was completed.
 * handleLogin prevents the default form submission, clears the previous error and sends the student ID and password to /api/auth/login in a JSON POST request.
 * A successful student login redirects to /dashboard and a successful admin login redirects to /tutor_dash.
 * An unsuccessful response displays the returned error message, with "Login failed." as a fallback.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 19:40
 * Test results: PASS
 * POST /api/auth/login 401 in 3.0s (next.js: 2.9s, application-code: 182ms)
 * POST /api/auth/login 200 in 76ms (next.js: 1851µs, application-code: 74ms)
 * GET /api/groups 304 in 503ms (next.js: 491ms, application-code: 12ms)
 * GET /api/groups/mine 200 in 559ms (next.js: 158ms, application-code: 401ms)
 * GET / 304 in 18ms (next.js: 5ms, application-code: 13ms)
 * POST /api/auth/login 200 in 65ms (next.js: 2ms, application-code: 63ms)
 * Invalid credentials kept the user on the login page and displayed "Invalid student ID or password."
 * Student n10000001 signed in successfully and was redirected to /dashboard, where Alice Chen's dashboard was displayed.
 * Admin hwang signed in successfully and was redirected to /tutor_dash, where the Admin Dashboard was displayed.
 * No browser errors were detected during the three login scenarios.
 */
