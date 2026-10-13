/**
 * pages/admin/units/[id]/enrol.js Tests
 */

/**
 * @function EnrolStudentPage
 * Test Criteria:
 * Do the nested function on this page work correctly?
 * Does the page render correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 15:50
 * Test results: PASS
 *  GET /admin/units/1/enrol?unitCode=IFB398 200 in 129ms (next.js: 105ms, application-code: 24ms)
    Page renders correctly with a valid unit.

    GET /admin/units/1/enrol?unitCode=hfghrfjj 200 in 43ms (next.js: 9ms, application-code: 34ms)
    Page renders normally with an invalid unit. An error is displayed when attempting to enrol a student in an invalid unit.

    All functions on the page work correctly.
 */

/**
 * @function handleChange
 * Test Criteria:
 * Does the function handle input changes correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 15:52
 * Test results: PASS
 * Inputs are updated correctly and parsed to other functions correctly.
 */

/**
 * @function showToast
 * Test criteria:
 * Does the function activate correctly?
 * Does the function display messages correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 15:53
 * Test results: PASS
 * Successfully enrolling a student creates a notification saying "Student enrolled to unit IFB398 successfully."
 * Incorrect field submissions return an error notification saying "Student not found"
 */

/**
 * @function handleSubmit
 * Test criteria:
 * Does the function submit data correctly?
 * Do errors display correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 15:54
 * Test results: PASS
 *  POST /api/admin/units/enrolments_students?unit=1&unitCode=IFB398 200 in 14ms (next.js: 2ms, application-code: 12ms)
    A valid student is enrolled in a valid unit successfully

 *  POST /api/admin/units/enrolments_students?unit=1&unitCode=hfghrfjj 404 in 10ms (next.js: 3ms, application-code: 7ms)
    Attempting to enrol a student in an invalid unit returns the correct 404 response code with a unit not found error.

    POST /api/admin/units/enrolments_students?unit=1&unitCode=IFB398 404 in 9ms (next.js: 4ms, application-code: 4ms)
    Attempting to enrol an invalid student into a valid unit returns the correct 404 response code.
 */