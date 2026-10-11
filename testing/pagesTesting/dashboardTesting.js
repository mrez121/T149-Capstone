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
 * 
 * FUNCTIONAL (black box) TEST #2
 * Tester name: Brandon Farnsworth
 * Date and time: 10/11/26 10:59
 * Test results: PASS
 *  GET /api/groups 200 in 54ms (next.js: 43ms, application-code: 11ms)
    GET /api/groups/mine 200 in 65ms (next.js: 15ms, application-code: 50ms)
    GET /api/groups 304 in 6ms (next.js: 1.3ms, application-code: 5ms)
    GET /api/groups/mine 304 in 10ms (next.js: 2ms, application-code: 8ms)
    Student information, tutorial slts, constraint status, and grouped view all displayed correctly
    "TU-019B264C-6" was copied using the `Copy ID` button correctly.
    `Student directory` button opens student directoty page correctly
    `Edit Availability and Profile` button opens the edit profile page correctly
    Clicking an empty group slot opens the student directory page correctly 
    `Browse students` button opens student directory page correctly
    `Leave group` button opens leave group prompt correctly
    `Lock group` button locks group correctly
    Locked group status displays correctly on dashboard when a group is locked.

    Ungrouped dashboard displays correctly with group creation tools and blank constraint status
    `Create group` button with a public group type selected creates a public group
    `Create group` button with a private group type selected create a private group
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
 * 
 * FUNCTIONAL (black box) TEST #2
 * Tester name: Brandon Farnsworth
 * Date and time: 11/10/26 11:16
 * Test results: PASS
 *  GET /api/groups 200 in 9ms (next.js: 3ms, application-code: 6ms)
    GET /api/groups/mine 200 in 10ms (next.js: 4ms, application-code: 6ms)
    GET /api/groups 304 in 8ms (next.js: 1.8ms, application-code: 7ms)
    GET /api/groups/mine 304 in 9ms (next.js: 3ms, application-code: 6ms)
    All student information loaded correctly.

    GET /dashboard 304 in 23ms (next.js: 9ms, application-code: 14ms)
    GET /api/groups 401 in 8ms (next.js: 5ms, application-code: 4ms)
    GET /api/groups/mine 401 in 12ms (next.js: 8ms, application-code: 4ms)
    401 response and redirect to login page when the user is not logged in and dashboard accessed.

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
 * 
 * FUNCTIONAL TEST #2
 * Tester name: Brandon Farnsworth
 * Date and Time: 11/10/26 11:19
 * Test results: PASS
 * Success toast was displayed after creating a group.
 * `Group 3 created` was the message
 * `You have left the group` was displayed after leaving the group
 * Both toasts disappeared automatically after approximately 4 seconds
 * 
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
 * 
 * FUNCTIONAL TEST #2
 * Tester name: Brandon Farnsworth
 * Date and time: 11/10/26 11:24
 * Test results: PASS
 *  POST /api/groups 201 in 16ms (next.js: 1.4ms, application-code: 15ms)
    GET /api/groups 200 in 8ms (next.js: 3ms, application-code: 4ms)
    GET /api/groups/mine 200 in 17ms (next.js: 2ms, application-code: 15ms)
    Group is stored in database correctly.
    Creator is added to the group as the first member
    Dashboard is updated automatically to display new group information
    Sucess message `Group 3 created` was displayed using toast function

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
 * 
 * FUNCTIONAL TEST #2
 * Tester name: Brandon Farnsworth
 * Date and time: 11/10/26 11:34
 * Test results: PASS
 *  POST /api/groups/join 200 in 28ms (next.js: 2ms, application-code: 25ms)
    GET /api/groups 200 in 13ms (next.js: 7ms, application-code: 6ms)
    GET /api/groups/mine 200 in 24ms (next.js: 4ms, application-code: 20ms)
    User Daren Kovacek (n10000015) was added to database under group Group 2 (G-29C18B)
    Dashboard updated correctly to display Daren in the group with creator Camren Weimann (n10000013)
    Success message displayed correctly.
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
 * 
 * FUNCTIONAL TEST #2
 * Tester name: Brandon Farnsworth
 * Date and time: 11/10/26 11:51
 * Test results: PASS
    [Resend API Error]: {
    status: 403,
    error: {
        message: 'You can only send testing emails to your own email address (teamup.student1@gmail.com). To send emails to other recipients, please verify a domain at resend.com/domains, and change the `from` address to an email using this domain.',
        name: 'validation_error',
        statusCode: 403
    },
    path: '/emails'
    }
    Email send error: {
    message: 'You can only send testing emails to your own email address (teamup.student1@gmail.com). To send emails to other recipients, please verify a domain at resend.com/domains, and change the `from` address to an email using this domain.',
    name: 'validation_error',
    statusCode: 403
    }
    POST /api/groups/invite 200 in 951ms (next.js: 94ms, application-code: 857ms)
    Resend API errors are expected in this test, as randomly generated email addresses are not real,
    Resend API key not configured to try and send emails to those addresses either, but this error indicates
    that the email notification is correctly triggering when an invite is sent.
    POST response shows that invite has been sent.
    Database shows that student n10000020 in group G-505A80 sent an invite to student n10000018.
    Invite status is correctly set to pending.
    Success message was `Invite sent to Brock Altenworth`

    ✓ Invite email sent to: teamup.student1@gmail.com
    POST /api/groups/invite 200 in 972ms (next.js: 91ms, application-code: 881ms)
    Successful email notification sent to Alice Chen using Resend API.
 * 
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
 * 
 * FUNCTIONAL TEST #2
 * Tester name: Brandon Farnsworth
 * Date and time: 11/10/26 12:05
 * Test results: PASS
 *  POST /api/groups/respond-invite 200 in 53ms (next.js: 18ms, application-code: 35ms)
    GET /api/groups 304 in 10ms (next.js: 6ms, application-code: 4ms)
    GET /api/groups/mine 200 in 15ms (next.js: 4ms, application-code: 12ms)
    Brock Altenworth accepted the invitation and was added to Group 4.
    Brock's dashboard updated automatically to reflect the change in group status.
    Invite status in database was updated to "accepted"
    Karley Rutherford (n10000019) declined the invitation to Group 4.
    Karley's dashboard updated to remove the invite pending section.
    The invite status in the database is updated to declined.
    Dashboard messages "You have joined the group" and "Invite declined" displayed correctly.
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
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 11/10/26 13:49
 * Test results: PASS
 *  POST /api/groups/lock 200 in 30ms (next.js: 13ms, application-code: 17ms)
    GET /api/groups 200 in 11ms (next.js: 7ms, application-code: 4ms)
    GET /api/groups/mine 200 in 19ms (next.js: 3ms, application-code: 16ms)
    Group creator was able to lock with only 2 members (minimum size requirement not valid for groups anymore)
    Non-creators cannot access the lock button when constraints are met
    Success message displayed "Group locked. Membership changes now disabled."
    Group status was set to "locked" in database
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
 * 
 * FUNCTIONAL TEST #2
 * Tester name: Brandon Farnsworth
 * Test results: PASS
 *  POST /api/groups/leave 200 in 27ms (next.js: 13ms, application-code: 13ms)
 *  A confirmation window was displayed before leaving the group
 *  Clicking cancel on the confirmation window keeps the user in the group.
 *  Clicking ok removes the user
 *  Dashboard is updated to the ungrouped view.
 *  Database is updated to reflect that the student has left the group.
 *  Group information is updated for other members to show that the user has left.
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
 * 
 * FUNCTIONAL TEST #2
 * Tester name: Brandon Farnsworth
 * Date and time: 11/10/26 12:57
 * Test results: PASS
 * POST /api/auth/logout 200 in 6ms (next.js: 2ms, application-code: 4ms)
 * The user was signed out successfully and redirected to the login page.
 */

/**
 * @function handleCopyTeamUpId
 * 
 * Test Criteria:
 * Does the button copy the correct TeamUp ID to the user's clipboard for pasting elsewhere?
 * 
 * UNIT TEST #1
 * Tester name: Brandon Farnsworth
 * Date and time: 11/10/26 12:12
 * Test results: PASS
 * Manual source code inspection was completed.
 * The function correctly writes the teamup id to the clipboard.
 * An error is thrown if the teamup id is not present in the student object.
 * 
 * FUNCTIONAL TEST #1
 * Tester name: Brandon Farnsworth
 * Date and time: 11/10/26 12:15
 * Test results: PASS
 * TeamUp ID TU-991CA780-1 copied from Karley Rutherford's dashboard using the button.
 * The message "TeamUp ID copied. Share it with classmates who need to invite you." was displayed correctly.
 * 
 */