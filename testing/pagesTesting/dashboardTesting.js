/**
 * pages/dashboard.js Test Results
 * Copy templates for UNIT and FUNCTIONAL testing as needed
 */

/**
 * @function Dashboard
 * 
 * Test Criteria:
 * Do all the nested functions activate correctly on this page?
 * Is HTML construction on this page correct?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/25 23:10
 * Test results: PASS
 * The JSX structure and conditional rendering are correct.
 * All buttons and forms are linked to the correct handler functions.
 * The page has the correct UI for loading, grouped, ungrouped, invitation, forming, and locked states.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/25 23:33
 * Test results: PASS
 * GET /dashboard 200 in 189ms (next.js: 174ms, application-code: 15ms)
 * Student information, tutorial slots, constraint status and the ungrouped view were displayed correctly.
 * The Student Directory button opened the correct page, and no loading, display or undefined-data errors occurred.
 */

/**
 * @function loadData
 * 
 * Test Criteria:
 * Is data loaded to the page correctly?
 * Are appropriate errors thrown?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/25 23:47
 * Test results: FAIL
 * loadData correctly loads the Dashboard data and redirects the user when a 401 response occurs.
 * However, it does not handle network errors or other unsuccessful responses.
 * If a request fails, the page may remain in the loading state.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 0:04
 * Test results: PASS
 * GET /api/groups 304 in 10ms (next.js: 3ms, application-code: 7ms)
 * GET /api/groups/mine 200 in 11ms (next.js: 5ms, application-code: 6ms)
 * The student information, tutorial slots, group data and public group data were loaded correctly.
 * When the user was not logged in, opening the Dashboard redirected the user to the login page.
 * No browser errors were detected.
 */

/**
 * @function showToast
 * 
 * Test Criteria:
 * Does the toast activate properly when called?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 0:16
 * Test results: PASS
 * Manual source code inspection was completed.
 * showToast stores the provided message and type in the toast state.
 * The default toast type is success.
 * The toast state is cleared automatically after 4500 milliseconds.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 0:26
 * Test results: PASS
 * The success toast appeared after creating Group 1.
 * The message was "Group 1 created."
 * The toast disappeared automatically after approximately 4.5 seconds.
 * No browser errors were detected.
 */

/**
 * @function handleCreate
 * 
 * Test Criteria:
 * Does a group get created correctly when this function is called?
 * Is the group data reflected in the database correctly?
 * Is the user creating the group added to the group correctly?
 * Is the page updated to reflect the new group data?
 * Are errors thrown correctly?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 0:32
 * Test results: PASS
 * Manual source code inspection was completed.
 * handleCreate sends a POST request with the selected group type.
 * A successful response displays a success toast and reloads the Dashboard data.
 * An unsuccessful response displays the returned error message in an error toast.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 0:40
 * Test results: PASS
 * POST /api/groups 201 in 13ms (next.js: 1235µs, application-code: 12ms)
 * Group 1 was created successfully.
 * The group data was stored correctly in the database.
 * The creator was added to the group as the first member.
 * The Dashboard updated and displayed the new group information.
 * The success message was "Group 1 created."
 * No browser errors were detected.
 */

/**
 * @function handleJoin
 * 
 * Test Criteria:
 * Can the user join a public group correctly?
 * Is the user added to the group in the database correctly?
 * Are errors thrown correctly?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 0:45
 * Test results: PASS
 * handleJoin sends a POST request containing the selected group ID.
 * A successful response displays a success toast and reloads the Dashboard data.
 * An unsuccessful response displays the returned error message in an error toast.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 0:49
 * Test results: PASS
 * POST /api/groups/join 200 in 30ms (next.js: 15ms, application-code: 15ms)
 * Ben Nguyen joined Group 1 successfully.
 * The student was added to the correct group in the database.
 * The Dashboard updated and displayed both group members correctly.
 * The success message was "Successfully joined the group."
 */

/**
 * @function handleInviteStudent
 * 
 * Test Criteria:
 * Is the invite created in the database correctly?
 * Are errors thrown correctly?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 0:57
 * Test results: PASS
 * handleInviteStudent sends a POST request containing the current group ID and target student ID.
 * A successful response displays a success toast and clears the student ID input.
 * An unsuccessful response displays the returned error message in an error toast.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 1:06
 * Test results: PASS
 * POST /api/groups/invite 200 in 17ms (next.js: 10ms, application-code: 7ms)
 * An invitation was sent to Clara Smith successfully.
 * The invite was stored in the database with the correct group, sender and target student.
 * The invite status was recorded as pending.
 * The student ID input was cleared after the invitation was sent.
 * The success message was "Invite sent to Clara Smith".
 * No browser errors were detected.
 */

/**
 * @function handleRespondInvite
 * 
 * Test Criteria:
 * Can the user accept an invite?
 * Can the user decline an invite?
 * Does accepting an invite add the user to the correct group?
 * Does accepting or declining an invite update the database correctly?
 * Are errors thrown correctly?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 1:18
 * Test results: PASS
 * handleRespondInvite sends a POST request containing the invite ID and selected action.
 * Accepting an invite displays a joined-group message and reloads the Dashboard data.
 * Declining an invite displays a declined message and reloads the Dashboard data.
 * An unsuccessful response displays the returned error message in an error toast.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 1:27
 * Test results: PASS
 * POST /api/groups/respond-invite 200 in 17ms (next.js: 1287µs, application-code: 16ms)
 * POST /api/groups/respond-invite 200 in 44ms (next.js: 25ms, application-code: 19ms)
 * Clara Smith accepted the invitation and was added to Group 1 correctly.
 * Clara's invite status was updated to accepted in the database.
 * Daniel Park declined the invitation and was not added to the group.
 * Daniel's invite status was updated to declined in the database.
 * The messages "You joined the group!" and "Invite declined." were displayed correctly.
 * No browser errors were detected.
 */

/**
 * @function handleLock
 * 
 * Test Criteria:
 * Can the group be locked by the creator once all requirements are met?
 * Is a user other than the group creator prevented from locking the group?
 * If a group does not meet the constraints, are they prevented from locking the group?
 * Are errors thrown correctly?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 1:37
 * Test results: PASS
 * The Lock group button is only displayed to the group creator when all group requirements are met.
 * handleLock sends a POST request containing the current group ID.
 * The API checks that the user is the group creator and validates all group requirements.
 * A successful response displays a success toast and reloads the Dashboard data.
 * An unsuccessful response displays the returned error message in an error toast.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 1:45
 * Test results: PASS
 * POST /api/groups/lock 200 in 21ms (next.js: 11ms, application-code: 10ms)
 * The group creator could not lock the group while it had only three members.
 * After all requirements were met, a non-creator could not access the Lock group button.
 * The group creator locked Group 1 successfully after the group reached four members and had a shared tutorial slot.
 * The group status was updated to locked in the database.
 * The success message was "Group locked and confirmed valid!"
 * No browser errors were detected.
 */

/**
 * @function handleLeave
 * 
 * Test Criteria:
 * Is a confirmation window shown to confirm that the user wants to leave their group?
 * Is the group information in the database updated to reflect that the user has left?
 * Does the page update correctly to show that the user has left?
 * Are errors thrown correctly?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 1:58
 * Test results: FAIL
 * Manual source code inspection was completed.
 * handleLeave displays a confirmation window before sending the leave request.
 * A successful response clears the group data and reloads the Dashboard.
 * However, unsuccessful responses and network errors are not handled.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 2:10
 * Test results: PASS
 * POST /api/groups/leave 200 in 136ms (next.js: 121ms, application-code: 15ms)
 * A confirmation window was displayed before leaving the group.
 * Cancelling the confirmation kept the user in the group.
 * After confirmation, the user was removed from the group in the database.
 * The Dashboard updated and displayed the ungrouped view correctly.
 * No browser errors were detected.
 */

/**
 * @function handleLogout
 * 
 * Test Criteria:
 * Is the user signed out from this page correctly?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 2:17
 * Test results: PASS
 * Manual source code inspection was completed.
 * handleLogout sends a POST request to /api/auth/logout.
 * The function waits for the logout request to complete and redirects the user to the login page.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Hongyun Wang
 * Date and time: 2026/8/26 2:29
 * Test results: PASS
 * POST /api/auth/logout 200 in 3ms (next.js: 1377µs, application-code: 1821µs)
 * The user was signed out successfully.
 * The user was redirected to the login page.
 * The Sign in button was displayed correctly.
 * No browser errors were detected.
 */