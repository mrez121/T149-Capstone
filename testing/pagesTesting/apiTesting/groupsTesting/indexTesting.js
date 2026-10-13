/**
 * pages/api/groups/index.js Test Results
 * Copy template for UNIT and FUNCTIONAL testing as needed
 */

/**
 * @function handler
 * 
 * Test Criteria:
 * 01.Does the function correctly check that the user is logged in?
 * 02.Does the function throw an appropriate error if the API is accessed with an incorrect method?
 * 
 * 03.GET method - does the function correctly identify the HTTP method as GET?
 * 04.GET method - does the function correctly fetch public groups with available space?
 * 05.GET method - are errors thrown correctly from this method?
 * 06.GET method - is the correct response code sent for both success and errors?
 * 07.GET method - is the correct data sent back to the calling function?
 * 
 * 08.POST method - does the function correctly identify the HTTP method as POST?
 * 09.POST method - does the function correctly check if the student is already in a group?
 * 10.POST method - does the function correctly set the type of group (public or private) based on the user's choice?
 * 11.POST method - does the function correctly auto-name the group?
 * 12.POST method - does the function correctly create the group in the database?
 * 13.POST method - does the function correctly add the group creator into the group?
 * 14.POST method - are errors thrown correctly from this method?
 * 15.POST method - is the correct response code sent for both success and errors?
 * 16.POST method - is the correct data sent back to the calling function?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Brandon Farnsworth
 * Date and time: 13/10/2026
 * Test results:
 * 01. PASS
 * 02. PASS
 * 
 * 03. PASS
 * 04. PASS
 * 05. PASS - errors are displayed in server in CLI.
 * 06. FAIL - response code 500 received for error. FIXED 13/10 by adjusting error check logic
 * 07. PASS
 * 
 * 08. PASS
 * 09. PASS
 * 10. PASS - Group G-74EB31 is set to private upon creation
 * 11. PASS - Group 2 name attached to group G-74EB31
 * 12. PASS - Group G-74EB31 is in database with correct details attached.
 * 13. PASS - User n10000012 is set as the group creator.
 * 14. FAIL - An error is not thrown if the user is not enrolled in a unit. FIXED 13/10 with error check
 * 15. PASS - Correct response codes are sent for both success and errors (200 for success, 401 for unauthorized, 400 and 405 for various not found methods)
 * 16. PASS
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Brandon Farnsworth
 * Date and time: 13/10/26
 * Test results:
 * 01. PASS
 * 02. PASS
 * 
 * 03. PASS
 * 04. PASS
 * 05. PASS
 * 06. PASS
 * 07. PASS
 * 
 * 08. PASS
 * 09. PASS
 * 10. PASS
 * 11. PASS
 * 12. PASS
 * 13. PASS
 * 14. FAIL - a nextjs error handler occurs. FIXED 13/10 by disabling button if student is not enrolled in a unit.
 * 15. FAIL - response code not sent for errors when student is not enrolled in a unit. FIXED 13/10 by disabling button if student is not enrolled in a unit.
 * 16. PASS
 */