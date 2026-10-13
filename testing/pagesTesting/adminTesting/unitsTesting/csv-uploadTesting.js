/**
 * pages/admin/units/csv-upload.js Testing
 */

/**
 * @function CsvUploadPage
 * Test criteria:
 * Does the page render correctly?
 * Do all functions on the page work correctly?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 14:29
 * Test results: FAIL
 * Page renders correctly, but functions do not work as intended, allowing for file types other
 * than csv to be uploaded.
 * A CSV file with the incorrect format can be uploaded and is not checked before attempting to write
 * to the database.
 * 
 * BUGS FIXED 13/10 by Brandon Farnsworth
 * Added file validation prior to reading file to prevent wrong file type from being uploaded.
 * An error is now displayed if the wrong file type is uploaded.
 * 
 * POST FIX Test results: PASS
 * Invalid files no longer allowed to be uploaded. Only CSV files can now be accepted.
 * A CSV file must match the expected format window on the page or else it will be rejected for upload.
 */

/**
 * @function handleFileChange
 * Test criteria:
 * Does the function update the uploaded file correctly?
 * Does the function read the file correctly? 
 * Does it display an error when an incorrect file type is uploaded?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 14:31
 * Test result: FAIL
 *  File updates correctly, but no validation against file type conducted.
 *  Any file type can be selected and uploaded. Tested Docx, PDF, WAV file types.
 * 
 * BUGS FIXED 13/10 by Brandon Farnsworth
 * See CsvUploadPage test case for full explanation.
 * 
 * POST FIX Test results: PASS
 * Changing upload files is reflected on the page correctly. An invalid file is rejected with an error.
 */

/**
 * @function handleSubmit
 * Test criteria:
 * Does the function submit the data from the CSV file to the database correctly?
 * Does it prevent incorrect file types from being submitted?
 * 
 * FUNCTIONAL TEST #1
 * Tester: Brandon Farnsworth
 * Date and time: 13/10/26 14:31
 * Test result: FAIL
 *  POST /api/admin/units/csv-enrol 200 in 50ms (next.js: 18ms, application-code: 32ms)
    A docx file was uploaded and submitted to the database.
    
    POST /api/admin/units/csv-enrol 413 in 16ms (next.js: 3ms, application-code: 13ms)
    [browser] ⨯ unhandledRejection: TypeError: NetworkError when attempting to fetch resource.
    A WAV file was uploaded to the page.
    
    POST /api/admin/units/csv-enrol 413 in 24ms (next.js: 3ms, application-code: 21ms)
    [browser] ⨯ unhandledRejection: SyntaxError: JSON.parse: unexpected character at line 1 column 1 of the JSON data
    A PDF file was uploaded to the page.
    
    No transaction made in database as the data was unreadable, but no errors were thrown.

    BUGS FIXED 13/10 by Brandon Farnsworth
    See CsvUploadPage test case for full explanation

    POST FIX Test results: PASS
    A correctly formatted CSV file is accurately read by the system. Already enrolled students are skipped over.
 * Enrolled students are enrolled correctly. Not found students are ignored, but highlighted as a separate category.
    Total in CSV count is accurate to contents of inputted CSV file.
 */