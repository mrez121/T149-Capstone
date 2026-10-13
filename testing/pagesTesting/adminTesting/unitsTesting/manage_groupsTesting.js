/**
 * pages/admin/units/manage_groups.js Test results
 * Copy templates for UNIT and FUNCTIONAL testing as needed.
 */

/**
 * @function ManageGroupsPage
 *
 * Test Criteria:
 * Do all nested functions activate correctly on this page?
 * Is HTML construction on this page correct?
 *
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/27 15:57
 * Test results: PASS
 * Manual source code inspection was completed.
 * ManageGroupsPage declares state for units, groups, selected unit, loading
 * status and toast feedback.
 * The page renders a loading state first, then displays unit cards after
 * loadUnits completes.
 * The page includes a Dashboard link, Sign out button, unit selection cards,
 * group result cards and an Unlock group action for each loaded group.
 *
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/27 15:57
 * Test results: PASS
 * Logged in with the hwang admin account.
 * GET /admin/units/manage_groups returned 200.
 * The Manage Groups page loaded successfully for an admin session.
 * The local test database was updated with groups.unit_id so the newly merged
 * group management feature could be tested against the current schema.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 17:24
 * Test results: PASS
 * Logged in with bfarnsworth admin account
 *  GET /admin/units/manage_groups 200 in 66ms (next.js: 54ms, application-code: 12ms)
    GET /api/admin/units 304 in 12ms (next.js: 6ms, application-code: 6ms)
    GET /api/admin/units/groups?unit=1&status=all&size=all&page=1&pageSize=25 200 in 12ms (next.js: 3ms, application-code: 9ms)
    Page loaded successfully for admin session. All information on page aligns with relevant database entries.

    GET /admin/units/manage_groups 304 in 28ms (next.js: 10ms, application-code: 17ms)
    GET /api/admin/units 403 in 8ms (next.js: 2ms, application-code: 6ms)
    Accessing the page with an unauthenticated account returned correct 403 response and redirected the user back to the admin dashboard
    
    MINOR BUG FIX 13/10 by Brandon Farnsworth
    No 401 status error possible on previous API version, which has now been corrected.
    Both 401 and 403 status codes now redirect back to the login page instead of the admin dashboard.
*/

/**
 * @function loadUnits
 *
 * Test Criteria:
 * Does the function fetch admin units correctly?
 * Do authentication and authorisation redirects behave correctly?
 *
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/27 15:57
 * Test results: PASS
 * Manual source code inspection was completed.
 * loadUnits fetches /api/admin/units when the page loads.
 * A 401 response redirects to the login page.
 * A 403 response redirects to /tutor_dash.
 * Successful responses store the unit list and end the loading state.
 *
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/27 15:57
 * Test results: PASS
 * GET /api/admin/units returned 200 for the hwang admin session.
 * The API returned IFB398 with group_count: 1.
 * The unit card could be used as the entry point for testing group management.
 *
 * REGRESSION TEST - retain group results after a page refresh
 * Tester name: Codex (automated browser interaction)
 * Date: 2026/9/4 (Australia/Brisbane)
 * Test results: PASS
 * Reloaded Manage Groups with TST826 as the only available course.
 * Group 2 (G-BBCE93) loaded automatically with Forming and a disabled Unlocked
 * button; selecting TST826 Groups manually was not required.
 * Then selected TST826 Groups and reloaded the page again. The same group
 * results were restored automatically. Four enrolled members remained intact.
 * Source inspection confirmed that a saved selection is used only when its
 * unit still appears in the current API response. With multiple units and no
 * valid saved selection, the page asks the admin to select a unit.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 17:29
 * Test results: PASS
 *  GET /admin/units/manage_groups 304 in 128ms (next.js: 106ms, application-code: 22ms)
    GET /api/admin/units 304 in 56ms (next.js: 25ms, application-code: 31ms)
    GET /api/admin/units/groups?unit=1&status=all&size=all&page=1&pageSize=25 200 in 12ms (next.js: 3ms, application-code: 8ms)
    Unit information loaded correctly from database when logged in with an authenticated user. 
    Page data matches database data.
 */

/**
 * @function showToast
 *
 * Test Criteria:
 * Do toast notifications show correctly when called?
 *
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/27 15:57
 * Test results: PASS
 * Manual source code inspection was completed.
 * showToast stores the supplied message and type in toast state.
 * The default toast type is success.
 * The toast is cleared automatically after 4000 milliseconds.
 *
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/27 15:57
 * Test results: PASS
 * The group fetch and unlock flows both call showToast after successful API
 * responses.
 * The expected success feedback was available for the page action flow.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 17:34
 * Test results: PASS
 * Notification displays when group data for a unit is fetched.
 * Notification displays when group is successfully unlocked.
 */

/**
 * @function getGroups
 *
 * Test Criteria:
 * Does the function fetch the correct groups for the selected unit?
 * Are API errors displayed correctly?
 *
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/27 15:57
 * Test results: PASS
 * Manual source code inspection was completed.
 * getGroups sends a GET request to /api/admin/units/groups with the selected
 * unit id.
 * Successful responses store the returned groups and selected unit code.
 * Failed responses display the API error through showToast.
 *
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/27 15:57
 * Test results: PASS
 * GET /api/admin/units/groups?unit=1 returned 200.
 * The response returned the local test group G-WLTEST, named WL Test Group,
 * with status locked.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 17:36
 * Test results: PASS
 *  GET /api/admin/units/groups?unit=1&status=all&size=all&page=1&pageSize=25 200 in 14ms (next.js: 4ms, application-code: 10ms)
    Correct response code returned. Correct group data returned. Group statuses correct. Group members correct.
    All data points reflect current database data.
 */

/**
 * @function unlockGroup
 *
 * Test Criteria:
 * Does the function unlock a locked group correctly?
 * Are API errors displayed correctly?
 *
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/27 15:57
 * Test results: PASS
 * Manual source code inspection was completed.
 * unlockGroup sends a POST request to /api/admin/units/groups with the target
 * group id.
 * Successful responses display a success toast.
 * Failed responses display the API error through showToast.
 *
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/27 15:57
 * Test results: PASS
 * POST /api/admin/units/groups?groupId=G-WLTEST returned 200.
 * Database inspection confirmed that G-WLTEST changed from locked to forming.
 * A second POST request returned 400 with the expected already unlocked error.
 *
 * REGRESSION TEST - immediate status update and disabled action
 * Tester name: Codex (automated browser interaction)
 * Date and time: 2026/9/4 12:37 (Australia/Brisbane)
 * Test results: PASS
 * Test data: TST826, Group 2 (G-BBCE93), created by n10000007.
 * The group contains four enrolled demo students and shares MON-09:00.
 * Signed in as the creator and locked the group through the student dashboard.
 * Signed in as the hwang admin and selected TST826 Groups.
 * Clicked Unlock group once on the locked group.
 * The success notification appeared and the same card immediately changed
 * from Locked to Forming, without reloading or selecting the unit again.
 * The action changed to Unlocked and was disabled.
 * An already-forming group also displayed the disabled Unlocked action when
 * initially loaded from the API.
 *
 * REGRESSION TEST - API failure preserves status and restores the action
 * Tester name: Codex (automated browser interaction)
 * Date and time: 2026/9/4 12:37 (Australia/Brisbane)
 * Test results: PASS
 * Kept a locked group open in the admin tab, then signed in as demo student
 * n10000004 in a second tab to simulate the session changing before the action.
 * Clicked Unlock group in the original admin tab.
 * The page displayed Admin access is required, retained Locked and restored
 * the enabled Unlock group button. No success state was shown on failure.
 * Restored the admin session and retried successfully in the original tab.
 *
 * UNIT (white box) - pending requests and toast lifetime
 * Tester name: Codex (source inspection)
 * Date and time: 2026/9/4 12:37 (Australia/Brisbane)
 * Test results: PASS
 * A synchronous ref guard rejects repeated unlock calls before a rerender.
 * While a request is pending, the target action displays Unlocking... and
 * group actions/unit queries are disabled. List reads and unlock writes
 * cannot overlap and overwrite the newly updated status with an older list.
 * finally clears the pending state after both success and failure.
 * Fetch/JSON exceptions display a readable error without changing the status.
 * Each new toast cancels the previous timeout; unmount also clears the timer.
 * The short local request duration did not allow a sustained pending state
 * or network failure to be observed in the browser; these paths were inspected.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 17:38
 * Test results: PASS
 *  POST /api/admin/units/groups?groupId=G-74EB31 200 in 11ms (next.js: 2ms, application-code: 9ms)
    GET /api/admin/units/groups?unit=1&status=all&size=all&page=1&pageSize=25 200 in 10ms (next.js: 3ms, application-code: 7ms)
    Unlock group button successfully calls POST request. Page is immediately updated to reflect change in group status.
    Notification is displayed correctly indicating successful unlock.
 */

/**
 * @function lockAllGroups
 * Test criteria:
 * Does a warning prompt appear to the user requiring confirmation of this operation?
 * Are all currently made groups locked after using this function?
 * Is every student not in a group in the unit placed in their own group and is that group locked?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 17:42
 * Test results:  PASS
 * Confirmation window appears when clicking lock all groups button. Clicking cancel prevents the operation
 * from continuing.
 *  POST /api/admin/units/lock_all_groups?unit=1&unitCode=IFB398 200 in 1082ms (next.js: 17ms, application-code: 1065ms)
    Groups 1, 2, and 3 were all locked correctly when this operation occured.
    All other students in the unit were placed into their own group which was then locked, resulting in
    a total of 251 locked groups.
    Students enrolled in a different unit were not affected by this operation.
    Signing in to user n10000015 confirmed that they were now in Group 6 and the group status was locked.
 */



/**
 * @function handleLogout
 *
 * Test Criteria:
 * Does the function log the admin out and return to the login page?
 *
 * UNIT (white box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/27 15:57
 * Test results: PASS
 * Manual source code inspection was completed.
 * handleLogout sends a POST request to /api/auth/logout and then redirects
 * the user to the login page.
 *
 * FUNCTIONAL (black box) TEST #1
 * Tester name: Weiyi Lu
 * Date and time: 2026/8/27 15:57
 * Test results: NOT RUN
 * Logout was not run during this pass because the focus of the test was the
 * newly merged group management functionality.
 * 
 * FUNCTIONAL TEST #2
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 17:26
 * Test results: PASS
 * POST /api/auth/logout 200 in 15ms (next.js: 5ms, application-code: 10ms)
    Logout function worked correctly and redirected the user back to the login page.
 */
