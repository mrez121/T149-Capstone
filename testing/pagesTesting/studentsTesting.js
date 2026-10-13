/**
 * pages/students.js Test results
 * Copy templates for UNIT and FUNCTIONAL testing as needed
 */

/**
 * @function StudentDirectory
 * 
 * Test Criteria:
 * Do all nested functions activate correctly on this page?
 * Is HTML construction on this page correct?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:07
 * Test results: PASS
 * Manual source code inspection was completed.
 * StudentDirectory declares the required state for the current student,
 * directory data, current group, search/filter controls, toast feedback and loading state.
 * The page renders a loading state first, then the directory hero, summary cards,
 * search/filter toolbar and student cards after loadData completes.
 * Nested handlers are connected to the correct buttons.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:07
 * Test results: PASS
 * Logged in as n10000001 with password123.
 * GET /students returned 200.
 * GET /api/students returned 200 and loaded 14 directory records.
 * Current student was returned as n10000001.
 * No server errors were detected during the page/API requests.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 11:10
 * Test results: PASS
 * Logged in as Porter McClure (n10000013)
 *  GET /api/students?q=&status=all&experience=all&cohort=&slot=&sort=name-asc&page=1&pageSize=25 200 in 36ms (next.js: 10ms, application-code: 26ms)
    GET /api/groups/mine 304 in 11ms (next.js: 1.8ms, application-code: 10ms)
    Student directory populated in full with correct number of enrolled students.
    No server errors detected during page/API requests
    Search bar fiters results automatically via student name, student id, or teamup id.
    Sort function applys correct ordering based on selection.
    All filters apply to search results correctly.
    BUG: Tutorial slot filter lists slots alphabetically instead of by id (order is FRI, MON, THU, TUE, WED instead of MON, TUE, WED, THU, FRI);
 */

/**
 * @function loadData
 * 
 * Test Criteria:
 * Does the function load the necessary data correctly?
 * Are errors thrown correctly?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:07
 * Test results: PASS
 * Manual source code inspection was completed.
 * loadData fetches /api/students and /api/groups/mine together with Promise.all.
 * If either request returns 401, the user is redirected to the login page.
 * Successful responses update student, students, myGroup and loading state.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:07
 * Test results: PASS
 * After student login, GET /api/students returned 200.
 * GET /api/groups/mine returned 200.
 * The current group was loaded as G-9D4249 for n10000001.
 * Directory data was available for rendering.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26
 * Test results: PASS
 * 250 students total, 247 available for invites, 3 in groups, 131 new students
 * Student name, number, teamupId, email, cohort, type, group status, and tutorial availability all returned correctly for each
 * row on page. 
 */

/**
 * @function showToast
 * 
 * Test Criteria:
 * Does the toast activate properly when called?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:07
 * Test results: PASS
 * Manual source code inspection was completed.
 * showToast stores the provided message and type in toast state.
 * The default toast type is success.
 * The toast state is cleared automatically after 4500 milliseconds.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:07
 * Test results: NOT RUN
 * Toast display was not manually clicked in this pass because the tested invite
 * flow would create database state. Source inspection confirms the toast is wired
 * through handleInvite success and error paths.
 * 
 * FUNCTION TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 11:20
 * Test Results: PASS
 * Toasts display correctly when inviting a student from the directory page. 
 * Green message `Invite sent to alice chen` when invite was sent to user with correct email for email notifications.
 * Yellow message `Invite saved, but the email notification could not be sent. Ask your classmate to check TeamUp.` when
 * invite sent to user with incorrect email for email notifications.
 * Red message `No shared tutorial slot found between all members.` displayed when attempting to invite a user that broke group constraints.
 */

/**
 * @function handleLogout
 * 
 * Test Criteria:
 * Is the user signed out from this page correctly?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:07
 * Test results: PASS
 * Manual source code inspection was completed.
 * handleLogout sends a POST request to /api/auth/logout and then redirects
 * the user back to the login page.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:07
 * Test results: NOT RUN
 * Logout was not clicked during this pass because this test focused on
 * Student Directory loading and navigation. The logout API has separate
 * testing coverage in auth/logout testing.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 11:24
 * Test result: PASS
 * POST /api/auth/logout 200 in 4ms (next.js: 1.7ms, application-code: 2ms)
 * Logout function correctly logs user out from student directory page 
 */

/**
 * @function handleViewProfile
 * 
 * Test Criteria:
 * Does the function open the correct student profile page?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:07
 * Test results: PASS
 * Manual source code inspection was completed.
 * handleViewProfile receives a target student ID and routes to
 * /students/[targetStudentId], matching the dynamic Student Profile route.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:07
 * Test results: PASS
 * GET /students/n10000001 returned 200 after student login.
 * The route matches the expected profile URL generated by handleViewProfile.
 * 
 * FUNCTIONAL TEST #2
 * Tester name: Brandon Farnsworth
 * Date and time: 13/10/26 11:35
 * Test results: PASS
 *  GET /api/students 200 in 25ms (next.js: 1.5ms, application-code: 24ms)
    GET /api/students 200 in 21ms (next.js: 1.2ms, application-code: 20ms)
    Function correctly redirects user to the requested student profile.
 */

/**
 * @function handleInvite
 * 
 * Test Criteria:
 * Does the function add the correct invite details to the database?
 * If the user is not a group creator, are they prevented from sending an invite?
 * Does the page update to reflect the sent invite correctly?
 * 
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:07
 * Test results: PASS
 * Manual source code inspection was completed.
 * handleInvite exits early if there is no current group.
 * When called with a group, it posts groupId and targetStudentId to /api/groups/invite.
 * The UI sets invitingId while the request is in progress and shows a toast
 * for either success or error responses.
 * The canInvite check prevents inviting the current user or students already in a group.
 * 
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/25 21:07
 * Test results: NOT RUN
 * The live invite action was not executed in this pass to avoid changing
 * the local invites table during documentation testing.
 * Preconditions were confirmed: n10000001 is the creator of forming group G-9D4249
 * and n10000002 is available, so a later controlled invite test can use those accounts.
 * 
 * FUNCTIONAL TEST #2
 * Tester name: Brandon Farnsworth
 * Date and time: 11/10/26 13:15
 * Test results: PASS
 *  GET /api/groups/mine 304 in 8ms (next.js: 1.4ms, application-code: 6ms)
    GET /api/students?q=&status=available&experience=all&cohort=&slot=&sort=name-asc&page=1&pageSize=25 200 in 12ms (next.js: 1.1ms, application-code: 11ms)
    GET /api/students?q=&status=available&experience=new&cohort=&slot=&sort=name-asc&page=1&pageSize=25 200 in 14ms (next.js: 1.1ms, application-code: 13ms)
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
    POST /api/groups/invite 200 in 404ms (next.js: 3ms, application-code: 401ms)
    Resend API error expected as API is not configured to send emails to invalid/fake email addresses. Error presence indicates that email notification system is triggering.
    User Camren Weimann was able to invite user Alana Kunde to Group 2 using the invite button on the student directory page
    User Daren Kovacek is in Group 2 but cannot invite other users as they are not the group creator.
    An invite sent in this way is correctly added to the database.

    #FUNCTION TEST #3
    Tester: Brandon Farnsworth
    Date and time: 13/10/26 11:20
    Test result: PASS

    ✓ Invite email sent to: teamup.student1@gmail.com
    POST /api/groups/invite 200 in 461ms (next.js: 3ms, application-code: 458ms)
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
    POST /api/groups/invite 200 in 837ms (next.js: 3ms, application-code: 835ms)
    GET /api/students?q=&status=all&experience=all&cohort=&slot=WED-16%3A00&sort=name-asc&page=1&pageSize=25 200 in 18ms (next.js: 3ms, application-code: 16ms)
    GET /api/students?q=&status=all&experience=all&cohort=&slot=&sort=name-asc&page=1&pageSize=25 200 in 19ms (next.js: 2.0ms, application-code: 18ms)
    POST /api/groups/invite 400 in 22ms (next.js: 4ms, application-code: 19ms)
    POST /api/groups/invite 400 in 215ms (next.js: 196ms, application-code: 19ms)

    Authenticated user attempted to invite 3 separate users. Each invite received a different notification depending on whether
    the invite was fully successful (with email notification), partially successful (invite sent but no email notification sent)
    or failed (no invite sent).
    Fully and partially successful invites were sent to database correctly.
    Invited users have the invite button replaced with a grey sent button.
 */
