/**
 * pages/api/groups/mine.js Test Results
 * Copy template for UNIT and FUNCTIONAL testing as needed
 */

/**
 * @function handler
 * 
 * Test Criteria:
 * 01.Does the function correctly determine that the HTTP method is GET?
 * 02.Does the function throw an error if the HTTP method is not GET?
 * 03.Does the function correctly check that the user is authenticated?
 * 04.Does the function throw an error if the user is not authenticated?
 * 
 * 05.Does the function fetch the correct group data from the database?
 * 06.Does the function throw an error if it cannot fetch group information from the database?
 * 
 * 07.Does the function fetch the correct group member data from the database?
 * 08.Does the function throw an error if it cannot fetch group member information from the database?
 * 
 * 09.Does the function fetch the correct availability data from the database?
 * 10.Does the function throw an error if it cannot fetch availability data from the database?
 * 
 * 11.Does the function correctly fetch any invites for the current user from the database?
 * 12.Does the function throw an error if it cannot fetch invite data from the database?
 * 
 * 13.Does the function return the correct response code for both success and errors?
 * 14.Does the function retunr the correct data to the calling function?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Brandon Farnsworth
 * Date and time: 13/10/26 10:20
 * Test results:
 * 01. PASS
 * 02. PASS
 * 03. PASS
 * 04. PASS - user is redirected to login page if attempting to access dashboard while not logged in.
 * 05. PASS - correct user information is fetched
 * 06. PASS - an error is displayed on the dashboard and the server CLI displays an error.
 * 07. PASS - correct data fetched
 * 08. FAIL - No error handling for being unable to fetch group member info from database
 * 09. PASS
 * 10. FAIL - No error handling for being unable to fetch availability from database
 * 11. PASS
 * 12. FAIL - No error handling for being unable to invites from database.
 * 13. PASS - correct response code received for success
 * 14. PASS
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Brandon Farnsworth
 * Date and time: 13/10/26 10:48
 * Test results:
 * 01. PASS
 * 02. PASS
 * 03. PASS
 * 04. PASS
 * 05. PASS
 * 06. PASS
 * 07. PASS
 * 08. PASS - Unit enrolment error on dashboard
 * 09. PASS
 * 10. PASS - Unit enrolment error on dashboard
 * 11. PASS
 * 12. PASS - Unit enrolment error on dashboard
 * 13. PASS
 * 14. PASS
 */