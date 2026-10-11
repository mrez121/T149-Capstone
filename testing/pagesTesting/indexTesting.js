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
 * Date and time: 2026/8/26 19:40
 * Test results: PASS
 * GET / 304 in 1086ms (next.js: 1025ms, application-code: 61ms)
 * The TeamUp login page loaded successfully at GET /.
 * The student ID field, password field, Sign in button and demo account information were displayed correctly.
 * The page title was "TeamUp — Login" and no browser errors were detected.
 * 
 * FUNCTIONAL (black box) TEST #2
 * Tester name: Brandon Farnsworth
 * Date and time: 11/10/26 10:32
 * Test results: PASS
 * TeamUp login page loaded successfully at GET /
 * Student ID field, password field, sign-in button, and demo account info displayed correctly.
 * Page title is "TeamUp - Login". No visual or browser errors detected.
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
 * Date and time: 2026/8/26 19:47
 * Test results: PASS
 * Manual source code inspection was completed.
 * handleLogin prevents the default form submission, clears the previous error and sends the student ID and password to /api/auth/login in a JSON POST request.
 * A successful student login redirects to /dashboard and a successful admin login redirects to /tutor_dash.
 * An unsuccessful response displays the returned error message, with "Login failed." as a fallback.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 19:58
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
 * 
 * FUNCTIONAL (black box) TEST #2
 * Tester name: Brandon Farnsworth
 * Date and time: 11/10/26 10:35
 * Test results: PASS
 * 
 * Login with valid credentials:
 * POST /api/auth/login 200 in 653ms (next.js: 318ms, application-code: 335ms)
 * GET /api/groups 200 in 70ms (next.js: 35ms, application-code: 34ms)
 * GET /api/groups/mine 200 in 29ms (next.js: 11ms, application-code: 18ms)
 * GET /api/groups 304 in 7ms (next.js: 1.5ms, application-code: 6ms)
 * GET /api/groups/mine 304 in 10ms (next.js: 2ms, application-code: 8ms)
 * 
 * Valid credentials stored in browser allowed for application to retain session after server restart
 * $ npm run dev

    > TeamUp@1.2.0 dev
    > next dev

    ▲ Next.js 16.3.8 (Turbopack)
    - Local:         http://localhost:3000
    - Network:       http://192.168.56.1:3000
    - Environments: .env.local
    ✓ Ready in 619ms
    ⚠ Warning: Next.js ignored package-lock.json in C:\Users\brand because it is outside the current Git repository (C:\Users\brand\Documents\QUT\ifb399\project\T149-Capstone).
    To use this directory, set `turbopack.root` in your Next.js config.

    ✓ Running next.config.js took 33ms

    GET /dashboard 200 in 304ms (next.js: 236ms, application-code: 68ms)
    GET /api/groups 304 in 360ms (next.js: 327ms, application-code: 33ms)
    GET /api/groups/mine 304 in 369ms (next.js: 261ms, application-code: 108ms)
    GET /dashboard 304 in 30ms (next.js: 10ms, application-code: 20ms)
    GET /api/groups 304 in 16ms (next.js: 10ms, application-code: 6ms)
    GET /api/groups/mine 304 in 25ms (next.js: 7ms, application-code: 18ms)

    Invalid login info returns a 401 response
    POST /api/auth/login 401 in 33ms (next.js: 26ms, application-code: 7ms)
    Page displays an "Invalid student ID or password" error box

    Students n10000001, n10000022, and n10000177 were all correctly redirected to student dashboard page
    Admin users bfarnsworth, hwang, and wlu were all correctly redirected to admin dashboard.
    No server or api errors found during valid login tests.
 */
