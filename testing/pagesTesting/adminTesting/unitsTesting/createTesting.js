/**
 * pages/admin/units/create.js Test Results
 * Copy template for UNIT and FUNCTIONAL testing as needed.
 */

/**
 * @function CreateUnitPage
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
 * CreateUnitPage declares form, error and loading state.
 * The form includes fields for unit code, unit name, semester, minimum group size,
 * maximum group size and maximum new students.
 * The constraint preview updates from the same form state used for submission.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:23
 * Test results: PASS
 * Logged in as hwang with password123.
 * GET /admin/units/create returned 200.
 * The Create Unit page loaded successfully for an admin account.
 * The live submit action was not performed during this page-load test.
 * 
 * FUNCTION TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 13:30
 * Test result: PASS
 * Logged in as bfarnsworth
 * GET /admin/units/create 200 in 71ms (next.js: 39ms, application-code: 33ms)
   Page renders correctly.
   Page is accessible without admin access, but form cannot be submitted while the user is not logged in.
 */

/**
 * @function handleChange
 * 
 * Test Criteria:
 * Does the form state update correctly when this function is called?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:23
 * Test results: PASS
 * Manual source code inspection was completed.
 * handleChange reads the input name and value from the React event.
 * The function updates only the matching field while preserving the rest of
 * the form state.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:23
 * Test results: NOT RUN
 * Manual browser input was not performed in this pass.
 * Source inspection confirms all form inputs are connected to handleChange
 * through onChange handlers.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 13:37
 * Test results: PASS
 * Form fields update correctly with input and store values in state correctly.
 */

/**
 * @function handleSubmit
 * 
 * Test Criteria:
 * Does the form submit correctly?
 * Is the database updated with the new unit correctly?
 * Are errors thrown correctly?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:23
 * Test results: PASS
 * Manual source code inspection was completed.
 * handleSubmit prevents the default form event, clears previous errors and
 * sets loading while the request is in progress.
 * The function posts the form to /api/admin/units and converts numeric
 * constraint fields to numbers before sending.
 * A successful response redirects to /admin/units; failed responses show an error.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:23
 * Test results: NOT RUN
 * The live create action was not submitted in this pass because it creates
 * new unit and constraint records in the database.
 * Page loading was verified separately with GET /admin/units/create returning 200.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 13:39
 * Test results: FAIL
 *  POST /api/admin/units 201 in 12ms (next.js: 1.6ms, application-code: 11ms)
    GET /api/admin/units 200 in 15ms (next.js: 3ms, application-code: 12ms)
    GET /api/admin/units 304 in 11ms (next.js: 3ms, application-code: 8ms)
    Function successfully submits provided form information to the database and then redirects the user to the units page.

    No input validation on unit code, unit name, or semester, allowing these fields to exceed database limits.
    No group constraint validation checks, which allows for minimum group size to be greater than max group size.
    BUGS FIXED 13/10/26

   POST FIX Test results: PASS
    Inputs exceeding database type limits now have an error thrown.
    Unit constraints are now validated to ensure that min_size and max_new cannot exceed max_size.
    Check is also done to ensure that min_size and max_size do not equal 0.
 */
