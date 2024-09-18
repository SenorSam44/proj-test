const fs = require('fs');
const path = require('path');
const proj4 = require('proj4');

// Helper function to read JSON files
function readTestCases(fileName) {
    return JSON.parse(fs.readFileSync(fileName));
}

// Function to compare values within a small margin of error (to handle floating-point precision)
function isCloseEnough(a, b, tolerance = 1e-5) {
    return Math.abs(a - b) < tolerance;
}

// Function to check test cases with dynamic UTM zones
function checkTestCases() {
    for (let fileNum = 1; fileNum <= 10; fileNum++) {
        const zone = 29 + fileNum;  // Adjust zone dynamically (same as Python script)

        // Define UTM projection string for the corresponding zone
        const utm = `+proj=utm +zone=${zone} +ellps=WGS84 +datum=WGS84 +units=m +no_defs`;

        const fileName = path.join(__dirname, '..', '..', `tests/test_cases_${fileNum}.json`);
        const testCases = readTestCases(fileName);

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const { latitude, longitude, easting: expectedEasting, northing: expectedNorthing } = testCase;

            console.log(`Processing case ${i + 1} in zone ${zone}`);
            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

            // Try reversing lat/lon if necessary
            const [easting, northing] = proj4('WGS84', utm, [latitude, longitude]);

            console.log(`Expected Easting: ${expectedEasting}, Expected Northing: ${expectedNorthing}`);
            console.log(`Actual Easting: ${easting}, Actual Northing: ${northing}`);

            // Compare values
            if (!isCloseEnough(easting, expectedEasting) || !isCloseEnough(northing, expectedNorthing)) {
                console.error(`Mismatch in ${fileName}, case ${i + 1}:`);
                console.error(`Zone: ${zone}`);
                console.error(`Expected: Easting = ${expectedEasting}, Northing = ${expectedNorthing}`);
                console.error(`Actual:   Easting = ${easting}, Northing = ${northing}`);
                process.exit(1);  // Stop execution on mismatch
            }
        }

        console.log(`${fileName} passed successfully for zone ${zone}!`);
    }
}

checkTestCases();

