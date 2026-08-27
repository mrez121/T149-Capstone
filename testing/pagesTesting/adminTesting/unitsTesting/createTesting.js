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
 */
