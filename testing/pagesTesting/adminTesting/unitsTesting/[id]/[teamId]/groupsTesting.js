/**
 * pages/admin/units/[id]/teams/[teamId]/groups.js Tests
 */

/**
 * @function TeamGroupsPage
 * Test criteria:
 * Does the page render correctly?
 * Do all the functions nested in the page work correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 18:12
 * Test results:
 *  GET /api/admin/units/teams_groups?unit=1&teamId=T149 200 in 16ms (next.js: 3ms, application-code: 13ms)
    GET /api/admin/units/teams_groups?unit=1&teamId=T149 304 in 10ms (next.js: 1.0ms, application-code: 9ms)
    GET /admin/units/1/teams/T149/groups?name=TeamUp&unitCode=IFB398 200 in 58ms (next.js: 24ms, application-code: 34ms)
    GET /api/admin/units/teams_groups?unit=undefined&teamId=undefined 304 in 17ms (next.js: 4ms, application-code: 14ms)
    GET /api/admin/units/teams_groups?unit=1&teamId=T149 304 in 21ms (next.js: 4ms, application-code: 17ms)
    Page renders correctly. Information matches database contents.
 * 
 */

/**
 * @function loadGroupAndUnitData
 * Test criteria:
 * Does the function load data correctly?
 * Are errors handled correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 18:16
 * Test results: PASS
 *  GET /api/admin/units/teams_groups?unit=1&teamId=T149 304 in 15ms (next.js: 2ms, application-code: 12ms)
    GET /api/admin/units/teams_groups?unit=1&teamId=T149 304 in 9ms (next.js: 1.1ms, application-code: 8ms)
    Groups and unit data is loaded correctly.

    If groups are allocated to another team, they are not included in this dataset.
 */

/**
 * @function showToast
 * Test criteria:
 * Do messages display correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26
 * Test results: PASS
 * Save notification displays correctly.
 */

/**
 * @function handleLogout
 * Test criteria:
 * Is the user logged out correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26
 * Test results: PASS
 * POST /api/auth/logout 200 in 8ms (next.js: 3ms, application-code: 5ms)
    User is logged out of the page correctly.
 */

/**
 * @function handleGroupSelect
 * Test criteria:
 * Are groups updated correctly when selected?
 * Are team size values updated?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 18:21
 * Test results: PASS
 * Group selection is updated correctly when groups are clicked.
 * Green groups become red and are removed from selection.
 * Red groups become green and are added to selection.
 * Team size and team new count variables update and change condition in realtime.
 */

/**
 * @function saveTeamGroups
 * Test criteria:
 * Is data saved to the database correctly?
 * Are errors handled correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 18:23
 * Test results:
 * Attempting to save team while unit constraints are exceeded prevents submission.
 * An appropriate error is thrown in this instance.
 * This applies to both team size and team new count.
 * Team that meets constraints can be saved to the database.
 * Database reflects team selection on page.
 */