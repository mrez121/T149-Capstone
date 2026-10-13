/**
 * pages/admin/units/[id].js
 * Copy template for UNIT and FUNCTIONAL testing as needed.
 */

/**
 * @function EditUnitPage
 * 
 * Test Criteria:
 * Do all nested functions activate correctly on this page?
 * Is HTML construction on this page correct?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 21:11
 * Test results: FAIL
 * Manual source code inspection was completed.
 * The page loads unit data and renders the edit form correctly for a valid unit ID.
 * However, the initial fetch does not check res.ok and has no error handler.
 * When the unit ID does not exist, the page renders an empty edit form instead
 * of displaying a loading error or Unit not found message.
 * FIXED 13/10/26 by Brandon Farnsworth
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 21:18
 * Test results: FAIL
 * Logged in with the hwang admin account.
 * POST /api/admin/units 500 in 336ms (next.js: 189ms, application-code: 147ms)
 * GET /admin/units 304 in 12ms (next.js: 5ms, application-code: 8ms)
 * GET /api/admin/units 200 in 8ms (next.js: 2ms, application-code: 6ms)
 * GET /admin/units/1 200 in 40ms (next.js: 26ms, application-code: 15ms)
 * GET /api/admin/units/1 200 in 7ms (next.js: 1860µs, application-code: 5ms)
 * GET /admin/units/999999 200 in 14ms (next.js: 5ms, application-code: 9ms)
 * GET /api/admin/units/999999 404 in 6ms (next.js: 1924µs, application-code: 4ms)
 * GET /admin/units/1 returned 200 and the existing TST826 unit loaded correctly.
 * Unit Code was disabled and the expected edit form was displayed.
 * GET /admin/units/999999 returned 200 while its data API returned 404.
 * The missing unit displayed an empty edit form instead of an error message.
 * FIXED 13/10/26 by Brandon Farnsworth
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 12:25
 * Test results: PASS
 *  GET /admin/units/1 304 in 23ms (next.js: 5ms, application-code: 17ms)
    GET /api/admin/units/1 304 in 9ms (next.js: 2ms, application-code: 7ms)
    Valid unit presents an editable form.
 *  
 *  GET /admin/units/999999 304 in 384ms (next.js: 169ms, application-code: 215ms)
    GET /api/admin/units/999999 404 in 18ms (next.js: 5ms, application-code: 13ms)
    GET /api/admin/units 304 in 10ms (next.js: 2ms, application-code: 7ms)
    GET /api/admin/units 304 in 9ms (next.js: 3ms, application-code: 6ms)
    Invalid unit redirects back to admin/units page automatically. In the
    event this doesn't happen, errors are thrown to warn the user.
 */

/**
 * @function handleChange
 * 
 * Test Criteria:
 * Does the form state update correctly when the function is called?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 21:29
 * Test results: PASS
 * Manual source code inspection was completed.
 * handleChange reads the input name and value and updates the matching property
 * while preserving the remaining form state.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 21:38
 * Test results: PASS
 * Unit Name, Semester, Min group size, Max group size and Max new students
 * were changed successfully.
 * The constraint preview immediately updated from 4-5 and 2 to 2-7 and 3.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 12:44
 * Test results: PASS
 * All form fields updated correctly. Constraint preview updated immediately with changes to constrain fields.
 */

/**
 * @function showToast
 * 
 * Test Criteria:
 * Does the toast activate properly when called?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 21:46
 * Test results: PASS
 * Manual source code inspection was completed.
 * showToast stores the supplied message and type in toast state.
 * The default type is success and the toast is cleared after 4000 milliseconds.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 21:57
 * Test results: PASS
 * PUT /api/admin/units/1 200 in 13ms (next.js: 2ms, application-code: 10ms)
 * The Unit updated successfully message appeared after Save changes was clicked.
 * The message disappeared automatically after approximately four seconds.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 12:46
 * Test results: PASS
 * `Unit updated successfully` notification displayed when unit form was submitted.
 * `Timeslot removed. Save changes before leaving page` notification displayed when timeslot was removed.
 * `IFB398 timeslots updated successfully` notification when saving timeslots
 * `Invalid timeslot input. Please use format DAY-HH:MM` notification when attempting to add an invalid timeslot.
 * `Unable to add duplicate timeslot to unit` notification when attempting to add a duplicate timeslot
 * 
 */

/**
 * @function handleSubmit
 * 
 * Test Criteria:
 * Does the function submit the correct data to the API?
 * Are errors thrown correctly?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 22:05
 * Test results: PASS
 * Manual source code inspection was completed.
 * handleSubmit sends a PUT request to /api/admin/units/[id].
 * The request includes unit_name, semester, min_size, max_size and max_new.
 * Numeric constraint values are converted using Number before submission.
 * Successful responses call showToast and API error responses update error state.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 22:14
 * Test results: FAIL
 * PUT /api/admin/units/1 200 in 15ms (next.js: 2ms, application-code: 12ms)
 * GET /admin/units/1 200 in 40ms (next.js: 26ms, application-code: 15ms)
 * GET /api/admin/units/1 200 in 7ms (next.js: 1860µs, application-code: 5ms)
 * PUT /api/admin/units/999999 404 in 5ms (next.js: 1424µs, application-code: 4ms)
 * PUT /api/admin/units/1 returned 200.
 * Unit Name and Semester were saved successfully.
 * However, the submitted constraint values 2, 7 and 3 were not persisted.
 * The page displayed Unit updated successfully, but after reloading the page
 * the constraint values returned to the defaults 4, 5 and 2.
 * Database inspection confirmed that the test unit had no unit_constraints row.
 * PUT /api/admin/units/999999 returned 404 and displayed Unit not found correctly.
 *
 * REGRESSION TEST - group size validation and save request recovery
 * Tester name: Codex (isolated handler execution with mocked fetch)
 * Date: 2026/9/4 (Australia/Brisbane)
 * Test results: PASS
 * Executed the actual handleSubmit function with controlled request responses.
 * Min/max values 6/4 and 10/2 displayed an error without sending a request.
 * Valid ranges 4/4 and 2/10 still sent a PUT request with numeric constraint values.
 * A pending request kept saving true; a network rejection restored it to false,
 * preserved form values and displayed an error. A subsequent retry succeeded.
 * Invalid JSON responses also restored saving and displayed an error.
 * API error messages were retained without showing a success notification.
 * These checks used no database writes and did not retest constraint persistence.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date: 13/10/26 12:51
 * Test results: FAIL
 * Form does no validation against string inputs, allowing for strings exceeding database type size limits.
 * BUG FIXED 13/10 by Brandon Farnsworth
 * 
 * POST FIX Test results: PASS
 *  PUT /api/admin/units/1 200 in 18ms (next.js: 3ms, application-code: 15ms)
    Form details submitted successfully. Both units and unit_constraints tables updated in database.
    No longer able to submit fields that exceed database type limits. Errors are shown to illustrate problems with inputs.
    Additional check to ensure that max_new cannot exceed max_size.
 */

/**
 * @function handleTimeslotInput
 * Test criteria:
 * Does the timeslotInput state update correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and Time: 13/10/26 13:12
 * Test result: PASS
 * Function correctly stores the timeslot input for formatting and validation.
 */

/**
 * @function formatTimeslot
 * Test criteria:
 * Does the function format a timeslot input correctly?
 * Does it return errors on an invalid input?
 * Can it accept inputs other than the specified format and still return the correct format?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 13:14
 * Test result: PASS
 * Function formats inputted timeslot values correctly.
 * "MON-18:00" accepted as valid input and displayed as such in timeslot field.
 * "monda 19" accepted as valid input and displayed as "MON-19:00" in timeslot field.
 * "fr 18:45" rejected as input with notification stating correct format
 * "njkgdsnfgk 22 15" rejected as input with notification stating correct format
 * "Tuesday 10:45" accepted as valid input and displayed as "TUE-10:45"
 * "Tuesday 1050" rejected as input with notification stating correct format
 */

/**
 * @function addSlot
 * Test criteria:
 * Does the function add a timeslot correctly?
 * Does it throw errors for incorrectly formatted or duplicate timeslots?
 * 
 * FUNCTIONAL TEST #1'
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 13:26
 * Test result: PASS
 * Clicking Add timeslot adds the timeslot to the timeslot field if it is a valid input.
 * An invalid input is rejected with a notification.
 */

/**
 * @function removeSlot
 * Test criteria:
 * Does the function remove a timeslot correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth\
 * Date and time: 13/10/26 13:26
 * Test result: PASS
 * Clicking a timeslot in the timeslot field removes it and displays a notification.
 */

/**
 * @function handleAvailabilitySub
 * Test criteria:
 * Does the function submit the timeslot information to the database correctly?
 * Are errors and success handled correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 13:27
 * Test result: PASS
 * PUT /api/admin/units/1 200 in 117ms (next.js: 2ms, application-code: 115ms)
 * Clicking Save Changes at the bottom of the timeslot form saves the changes to the database and
 * displays a message saying "IFB398 timeslots updated successfully."
 */