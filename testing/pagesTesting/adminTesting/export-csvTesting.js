/**
 * pages/admin/export-csv Test results
 * Copy templates for UNIT and FUNCTIONAL testing as needed
 */

/**
 * @function ExportCsvPage
 * Test criteria:
 * Does the page render all elements correctly?
 * Do all nested functions work correctly?
 * 
 * UNIT TEST #1
 * Tester:
 * Date and time:
 * Test result:
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 12:03
 * Test result: PASS
 *  GET /api/admin/units 304 in 15ms (next.js: 6ms, application-code: 9ms)
    GET /api/admin/units 304 in 11ms (next.js: 3ms, application-code: 9ms)
    All elements in page rendered successfully.
    All functions on page work correctly.
 */

/**
 * @function handleExport
 * Test criteria:
 * Does browser blob window display correctly to save the file?
 * Does the downloaded file contain the correct data?
 * 
 * UNIT TEST #1
 * Tester:
 * Date and time:
 * Test results:
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 12:04
 * Test results: PASS
 *  GET /api/admin/export-csv?unitCode=IFB398&fullExport=true 200 in 76ms (next.js: 33ms, application-code: 43ms)
    Full export on IFB398 produced csv file with correct information. Browser blob window also displayed correctly.

    GET /api/admin/export-csv?unitCode=IFB398&fullExport=false 200 in 24ms (next.js: 5ms, application-code: 19ms)
    Student id only export on IFB398 produced CSV file with correct information.
    However, data was presented out of order.
    BUG FIXED 13/10 - csv data for student id export CSV now orders by student number correctly.

    HTML updates correctly when export type is changed.
    Blob window for saving file displays correctly in all instances.

    GET /api/admin/export-csv?unitCode=CAB403&fullExport=false 200 in 19ms (next.js: 6ms, application-code: 12ms)
    CSV for a different unit was selected. Correct contents were downloaded.
 */