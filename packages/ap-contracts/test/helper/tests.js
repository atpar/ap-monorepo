const fs = require('fs')

const PAMTestTermsPath = './actus-resources/test-terms/pam-test-terms.csv'
const PAMTestResultDirectory = './actus-resources/test-results/'

const { 
  parseTermsFromPath, 
  parseResultsFromPath, 
  fromPrecision, 
  unixToISO 
} = require('../../actus-resources/parser')
 

function getTestCases () {
  return parseTermsFromPath(PAMTestTermsPath)
}

async function getDefaultTerms () {
  return (await getTestCases())['10001']
}

async function getTestResults () {
  const files = []
  const testResults = {}

  fs.readdirSync(PAMTestResultDirectory).forEach(file => {
    if (file.split('.')[1] !== 'csv') { return }
    files.push(file)
  })

  let promises = files.map(async (file) => {
    const result = await parseResultsFromPath(PAMTestResultDirectory + file)
    let testName = file.split('.')[0].slice(9, 14)
    testResults[testName] = result
  })

  await Promise.all(promises)
  return testResults
}

function toTestEvent (contractEvent, contractState) {
  return [
    unixToISO(contractEvent['scheduledTime']),
    contractEvent['eventType'],
    fromPrecision(contractEvent['payoff']),
    fromPrecision(contractState['nominalValue']),
    fromPrecision(contractState['nominalRate']),
    fromPrecision(contractState['nominalAccrued'])
  ]
}

module.exports = { getTestCases, getDefaultTerms, getTestResults, toTestEvent }
