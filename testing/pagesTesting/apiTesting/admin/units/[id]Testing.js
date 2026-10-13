/**
 * pages/api/admin/units/[id].js Test Results
 * Copy template for UNIT and FUNCTIONAL testing as needed
 */

/**
 * @function handler
 * 
 * Test Criteria:
 * 01.Does the function correctly check that the current user is logged in and is an admin?
 * 
 * 02.GET method - does the handler function correctly identify the HTTP method as GET?
 * 03.GET method - does the function find the correct unit information from the database?
 * 04.GET method - are errors thrown correctly for this method?
 * 05.GET method - is the correct response code sent for both success and errors?
 * 06.GET method - is the correct data sent back to the calling function?
 * 
 * 07.PUT method - does the handler function correctly identify the HTTP method as PUT?
 * 08.PUT method - does the function check if the unit already exists correctly?
 * 09.PUT method - does the function update the specified unit in the database correctly?
 * 10.PUT method - does the function update the specified unit's constraints in the database correctly?
 * 11.PUT method - are errors thrown correctly for this method?
 * 12.PUT method - is the correct response code sent for both success and errors?
 * 13.PUT method - is the correct data sent back to the calling function?
 * 
 * 14.DELETE method - does the handler function correctly identify the HTTP method as DELETE?
 * 15.DELETE method - does the function check if the unit already exists correctly?
 * 16.DELETE method - does the function check if the unit has groups already? If it does, does the function prevent the unit from being deleted?
 * 17.DELETE method - does the function delete constraints and enrolments from the unit correctly?
 * 18.DELETE method - are errors thrown correctly for this method?
 * 19.DELETE method - is the correct response code sent for both success and errors?
 * 20.DELETE method - is the correct data sent back to the calling function?
 * 
 * 21.Other methods - is the 'method not allowed' error thrown when accessing this api with an incorrect method?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/9/7 14:06
 * Test results:
 * 10.Failed — The constraint update uses the numeric unit ID instead of the unit code.
 * FAIL UNIT-PUT-CONSTRAINT-KEY: PUT binds unit_code for the schema unit_constraints.unit_id foreign key
 *
 * 17.Failed — The explicit constraint and enrolment deletion queries use incorrect parameters.
 * Database cascade deletion masks this issue in the functional test.
 * FAIL UNIT-DELETE-CONSTRAINT-KEY: DELETE constraints uses its schema foreign key value (unit code)
 * FAIL UNIT-DELETE-ENROLMENT-KEY: DELETE enrolments uses a scalar unit code instead of the SELECT row array
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/9/7 14:06
 * Test results:
 * 3.Failed — GET does not retrieve the unit’s stored constraints correctly.
 * FAIL [03,06] HTTP-GET-CONSTRAINTS: GET returns actual stored constraint values
 *
 * 6.Failed — GET returns null constraint values instead of the stored values.
 *  Database=[4,5,2], returned=[null,null,null]
 *
 * 10.Failed — PUT does not save the requested constraint changes.
 * FAIL [10,12,13] HTTP-PUT-CONSTRAINTS: PUT persists requested constraint changes instead of reporting false success
 * Requested=[3,6,1], database after PUT=[4,5,2]
 *
 * 12.Failed — PUT returns HTTP 200 even though the requested constraint changes are not saved.
 *  Response: HTTP 200 {"ok":true}
 *
 * 13.Failed — PUT returns ok: true, incorrectly indicating that the constraint update succeeded.
 * PUT response: HTTP 200 {"ok":true}
 * 
 * ISSUES ABOVE fixed as of 13/10 based on testing conducted in pages/admin/units/[id].
 */