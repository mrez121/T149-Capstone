/**
 * pages/api/groups/invite.js Test Result
 * Copy template for UNIT and FUNCTIONAL testing as needed
 */

/**
 * @function handler
 * 
 * Test Criteria:
 * 01.Does the function correctly determine if the HTTP method is POST?
 * 02.Does the function correctly throw an error if the HTTP method is not POST?
 * 03.Does the function correctly check that the user is logged in?
 * 04.Does the function correctly throw an error if the user is not logged in?
 * 
 * 05.Does the function correctly gather the target student and the group from the request?
 * 06.Does the function throw an error if the target student or group haven't been provided?
 * 
 * 07.Does the function correctly check if the user sending the invite is the creator of the group they are in?
 * 08.Does the function throw an error if the user is not the group creator?
 * 
 * 09.Does the function correctly check if the user's group's status is locked?
 * 10.Does the function throw an error if the user's group's status is locked and they try to send an invite?
 * 
 * 11.Does the function correctly check if the target student exists?
 * 12.Does the function throw an error if the target student does not exist?
 * 
 * 13.Does the function correctly check if the target student is the current student?
 * 14.Does the function throw an erro if the user tries to invite themselves?
 * 
 * 15.Does the function correctly check if the target student is already in a group?
 * 16.Does the function thrown an error if the target student is already in a group?
 * 
 * 17.Does the function correctly check if the target student will break the group's constraints?
 * 18.Does the function throw an error if the target student will break the group's constraints by joining?
 * 
 * 19.Does the function correctly check if an invite for the target student for this group already exists?
 * 20.Does the function throw an error if an invite for the target student for this group already exists?
 * 21.Does the function update the already existing invite in the database?
 * 
 * 22.Does the function add a new invite for the target student for the group to the database?
 * 23.Does the function throw an error if it is unable to add an invite to the database?
 * 
 * 24.Does the function return the correct response code for both success and errors?
 * 25.Does the function return the correct data to the calling function?
 * 
 * UNIT (white box) TEST #1
 * Tester name: 
 * Date and time:
 * Test results:
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Brandon Farnsworth
 * Date and time: 11/10/26 11:51
 * Test results:
 * 01: PASS
 * 02:  
 */