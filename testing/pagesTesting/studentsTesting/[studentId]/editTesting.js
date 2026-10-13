/**
 * pages/students/[studentId] Test results
 * Copy templates for UNIT and FUNCTIONAL testing as needed.
 */

/**
 * @function EditProfilePage
 * Test Criteria:
 * Do all nested functions activate correctly on this page?
 * Is HTML construction on this page correct?
 * 
 * UNIT TEST #1
 * Tester name:
 * Date and Time:
 * Test result:
 * 
 * FUNCTIONAL TEST #1
 * Tester name: Brandon Farnsworth
 * Date and Time: 13/10/26 11:45
 * Test result: PASS
 * All page elements rendered correctly.
 * All page functions work correctly.
 */

/**
 * @function loadStudentProfile
 * Test Criteria:
 * Is the correct data fetched from the database?
 * 
 * UNIT TEST #1
 * Tester:
 * Date and time:
 * Test result:
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 11:46
 * Test result: PASS
 *  GET /api/students/TU-DDC56CEA-B 200 in 12ms (next.js: 3ms, application-code: 9ms)
    GET /api/students/TU-DDC56CEA-B 304 in 9ms (next.js: 2ms, application-code: 6ms)
    The page displays the information from the database in the correct form fields and matches what is contained in the database.
 */

/**
 * @function handleLogout
 * Test Criteria:
 * Does the function log the user out of the site correctly?
 * 
 * UNIT TEST #1
 * Tester:
 * Date and time:
 * Test result:
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 11:48
 * Test result: PASS
 * POST /api/auth/logout 200 in 8ms (next.js: 3ms, application-code: 5ms)
    User logged out of application directly from this page and was returned to the login screen
 */

/**
 * @function handleChange
 * Test Criteria:
 * Does the function update values correctly?
 * 
 * UNIT TEST #1
 * Tester:
 * Date and time:
 * Test result:
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 11:49
 * Test result: PASS
 * All changes to profile form are handled correctly
 */

/**
 * @function showToast
 * Test Criteria:
 * Does the function display messages correctly?
 * 
 * UNIT TEST #1
 * Tester:
 * Date and time:
 * Test result:
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 11:52
 * Test result: PASS
 * Saving profile displays a `Profile details updated successfully` notification.
 * Saving availability displays a `Availability details updated successfully notification.
 */

/**
 * @function handleProfileSubmit
 * Test Criteria:
 * Does the function submit profile information correctly?
 * 
 * UNIT TEST #1
 * Tester:
 * Date and time:
 * Test result:
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 11:53
 * Test result: PASS
 *  PUT /api/students/TU-DDC56CEA-B 200 in 17ms (next.js: 5ms, application-code: 12ms)
    Database reflects profile form changes correctly for all fields.
 */

/**
 * @function handleSlotSelect
 * Test Criteria:
 * Does the function update selected timeslots correctly?
 * 
 * UNIT TEST #1
 * Tester:
 * Date and time:
 * Test result:
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 11:55
 * Test result: PASS
 * Clicking a timeslot when it is red makes it green and adds it to the user's availability
 * Clicking a timeslot when it is green makes it red and removes it from the user's availability.
 */

/**
 * @function handleAvailabilitySubmit
 * Test Criteria:
 * Does the function submit user availability correctly?
 * 
 * UNIT TEST #1
 * Tester:
 * Date and time:
 * Test result:
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 11:56
 * Test result: PASS
 *  PUT /api/students/TU-DDC56CEA-B 200 in 30ms (next.js: 4ms, application-code: 26ms)
 * Clicking save availability button saves the selected timeslots to the database.
 */