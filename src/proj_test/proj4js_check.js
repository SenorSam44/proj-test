const fs = require('fs');
const proj4 = require('proj4');
const path = require('path');


// Define UTM zone 33N for WGS84
const utm33n = '+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs';

// Helper function to read JSON files
function readTestCases(fileName) {
    return JSON.parse(fs.readFileSync(fileName));
}

// Function to compare values within a small margin of error (to handle floating-point precision)
function isCloseEnough(a, b, tolerance = 1e-5) {
    return Math.abs(a - b) < tolerance;
}

// Function to check test cases
function checkTestCases() {
    for (let fileNum = 1; fileNum <= 10; fileNum++) {
        const fileName = file_name = path.join(__dirname, '..', '..', `tests/test_cases_${fileNum}.json`);
        const testCases = readTestCases(fileName);

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const { latitude, longitude, easting: expectedEasting, northing: expectedNorthing } = testCase;

            // Convert lat/lon to UTM using proj4js
            const [easting, northing] = proj4('WGS84', utm33n, [longitude, latitude]);

            // Compare values
            if (!isCloseEnough(easting, expectedEasting) || !isCloseEnough(northing, expectedNorthing)) {
                console.error(`Mismatch in ${fileName}, case ${i + 1}:`);
                console.error(`Expected: Easting = ${expectedEasting}, Northing = ${expectedNorthing}`);
                console.error(`Actual:   Easting = ${easting}, Northing = ${northing}`);
                process.exit(1);  // Stop execution on mismatch
            }
        }

        console.log(`${fileName} passed successfully!`);
    }
}

checkTestCases();

