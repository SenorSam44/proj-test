const fs = require('fs');
const path = require('path');
const proj4 = require('proj4');

// Helper function to read JSON files
function readTestCases(fileName) {
    return JSON.parse(fs.readFileSync(fileName));
}

// Function to calculate error value and percentage error between two values
function calculateError(expected, actual) {
    const absoluteError = Math.abs(expected - actual);
    const percentageError = (absoluteError / Math.abs(expected)) * 100;
    return { absoluteError, percentageError };
}

// Function to check test cases
function checkTestCases() {
    for (let fileNum = 1; fileNum <= 10; fileNum++) {
        const zone = 29 + fileNum;  // Adjust zone dynamically (same as Python script)
        const fileName = path.join(__dirname, '..', '..', `tests/test_cases_${fileNum}.json`);

        try {
            const testCases = readTestCases(fileName);
            const totalTestCases = testCases.length; // Count total test cases
            console.log(`Checking ${totalTestCases} test cases from ${fileName}...`);

            let totalLatError = 0;
            let totalLonError = 0;
            let mismatchCount = 0;

            for (let i = 0; i < testCases.length; i++) {
                const testCase = testCases[i];
                const { easting, northing, converted_latitude, converted_longitude } = testCase;

                // Define UTM projection string for the corresponding zone
                const utm = `+proj=utm +zone=${zone} +ellps=WGS84 +datum=WGS84 +units=m +no_defs`;

                // Convert UTM to WGS84 (lon/lat) using proj4js
                const [actual_longitude, actual_latitude] = proj4('WGS84', utm, [easting, northing]);

                // Calculate error for latitude and longitude
                const latError = calculateError(converted_latitude, actual_latitude);
                const lonError = calculateError(converted_longitude, actual_longitude);

                // Check if there's a mismatch (for example, you can define a threshold)
                if (latError.percentageError > 0.0001 || lonError.percentageError > 0.0001) {
                    mismatchCount++;
                    totalLatError += latError.absoluteError;
                    totalLonError += lonError.absoluteError;
                }
            }

            // Calculate average errors
            const averageLatError = totalLatError / (totalTestCases || 1);
            const averageLonError = totalLonError / (totalTestCases || 1);

            // Log the overall results for the file
            console.log(`Results for ${fileName}:`);
            console.log(`Total test cases: ${totalTestCases}`);
            console.log(`Total mismatches: ${mismatchCount}`);
            console.log(`Average Latitude Absolute Error: ${averageLatError.toFixed(6)}`);
            console.log(`Average Latitude Error Percentage: ${(averageLatError / Math.abs(totalTestCases)) * 100 || 0}.toFixed(6)%`);
            console.log(`Average Longitude Absolute Error: ${averageLonError.toFixed(6)}`);
            console.log(`Average Longitude Error Percentage: ${(averageLonError / Math.abs(totalTestCases)) * 100 || 0}.toFixed(6)%`);
            console.log('-------------------------------------------');

        } catch (error) {
            console.error(`Error reading or processing ${fileName}: ${error.message}`);
        }
    }
}

checkTestCases();

