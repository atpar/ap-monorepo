const fs = require('fs');

const { parseTermsFromPath, parseResultsFromPath } = require('./parser');

const PAMTestTermsPath = './ref-test-terms/pam-test-terms.csv';
const PAMTestResultDirectory = './ref-test-results/';
const OUTPUT_DIR_TESTS = './test-terms/';
const OUTPUT_DIR_RESULTS = './test-results/';


async function getTestCases () {
  return parseTermsFromPath(PAMTestTermsPath);
}

async function getTestResults () {
  const files = [];
  const testResults = {};

  fs.readdirSync(PAMTestResultDirectory).forEach(file => {
    if (file.split('.')[1] !== 'csv') { return; }
    files.push(file);
  })

  let promises = files.map(async (file) => {
    const result = await parseResultsFromPath(PAMTestResultDirectory + file);
    let testName = file.split('.')[0].slice(6, 9) + '-' + file.split('.')[0].slice(9, 14);
    testResults[testName] = result;
  })

  await Promise.all(promises);
  return testResults;
}

function getContractTypeAsText (contractType) {
  switch (contractType) {
    case 0:
      return 'PAM';
    default:
      new Error('Invalid Contract Type!');
  }
}

(async () => {
  const testCases = await getTestCases();
  for (testCase of Object.keys(testCases)) {
    const fileName = 'Test-' + getContractTypeAsText(testCases[testCase].contractType) + '-' + testCase; 
    fs.writeFileSync(OUTPUT_DIR_TESTS + fileName + '.json', JSON.stringify(testCases[testCase], null, 4));
  }

  const testResults = await getTestResults();  
  for (testResult of Object.keys(testResults)) {
    const fileName = 'Result-' + testResult;
    fs.writeFileSync(OUTPUT_DIR_RESULTS + fileName + '.json', JSON.stringify(testResults[testResult], null, 4));
  }

  process.exit();
})();


process.on('uncaughtException', (err) => console.log(err));
