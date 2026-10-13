/**
 * pages/admin/units/[id]/unenrol.js Tests
 */

/**
 * @function UnenrolStudentPage
 * Test criteria:
 * Is the page rendered correctly?
 * Are all nested functions on this page working correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 16:04
 * Test results: PASS
 *  GET /admin/units/3/unenrol?unitCode=IFB666 200 in 83ms (next.js: 67ms, application-code: 16ms)
    Valid unit returns correct page layout and information.

    GET /admin/units/3/unenrol?unitCode=hrghlkdfsnkl;hs 200 in 27ms (next.js: 6ms, application-code: 21ms)
    An invalid unit returns the normal page, with the unit code taken from the invalid URL parameter.

    All functions below work correctly.
 */

/**
 * @function handleChange
 * Test criteria:
 * Does the function handle user inputs on the page correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 16:06
 * Test results: PASS
 * Input fields on page update correctly and field values are submitted correctly to API on submit.
 */

/**
 * @function showToast
 * Test criteria:
 * Does the function display notifications correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 16:07
 * Test results: PASS
 * Correct success and error notifications are displayed on when submit function is activated and finished processing.
 */

/**
 * @function handleSubmit
 * Test criteria:
 * Does the function submit data correctly?
 * Are errors handled correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 16:08
 * Test results: PASS
 * DELETE /api/admin/units/enrolments_students?unit=3&unitCode=IFB666 200 in 13ms (next.js: 3ms, application-code: 9ms)
    Unenrolling a student from a unit they are enrolled in returns correct 200 response and displays a notification
    saying that the student was unenrolled successfully. Change is reflected in the database correctly.
 *  
 *  DELETE /api/admin/units/enrolments_students?unit=3&unitCode=IFB666 404 in 9ms (next.js: 1.8ms, application-code: 7ms)
    Unenrolling a real student from a valid unit that they are not enrolled in returns correct 404 response code and an error saying student is not enrolled in this unit.
 * 
 *  DELETE /api/admin/units/enrolments_students?unit=3&unitCode=hrghlkdfsnkl;hs 404 in 8ms (next.js: 2ms, application-code: 6ms)
    Unenrolling a real student from an invalid unit returns correct 404 response code and an error saying student is not enrolled in unit.

    DELETE /api/admin/units/enrolments_students?unit=3&unitCode=IFB666 404 in 6ms (next.js: 1.9ms, application-code: 4ms)
    Unenrolling an invalid student from a real unit returns correct 404 response code and error saying student not found.
 */