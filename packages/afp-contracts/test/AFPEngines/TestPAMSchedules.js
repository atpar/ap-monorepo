const Web3 = require('web3')
const fs = require('fs')

const PAMEngineArtifact = artifacts.require('PAMEngine.sol')
const PAMEngine = require('../../build/contracts/PAMEngine.json')

const parseTestResults = require('../parser.js').parseTestResults
const parseContractTerms = require('../parser.js').parseContractTerms

const PAMTestTerms = './test/contract-templates/pam-test-terms.csv'
const PAMTestResultDirectory = './test/contract-templates-results/'
 
const getTestResults = async () => {
  const files = []
  const testResults = {}

  fs.readdirSync(PAMTestResultDirectory).forEach(file => {
    if (file.split('.')[1] !== 'csv') { return }
    files.push(file)
  })

  let promises = files.map(async (file) => {
    const result = await parseTestResults(PAMTestResultDirectory + file)
    let testName = file.split('.')[0].slice(9, 14)
    testResults[testName] = result
  })

  await Promise.all(promises)
  return testResults
}

const getContractTerms = (precision) => {
  return parseContractTerms(PAMTestTerms, precision)
}

contract('PAMEngine', () => {

  let PAMEngineDeployed
  let precision
  let testTerms
  let refTestResults

  const calculateContractEventSchedule = async (contractTerms) => {
    let response = await PAMEngineDeployed.methods.getInitialState(contractTerms).call()
    let contractState = response[0]
    let eventSchedule = response[1]

    // eventSchedule.sort((a,b) => {
    //   // if (a[1] == b[1]) { return 0 }
    //   // if (a[1] == 0) { return 1 }
    //   // if (b[1] == 0) { return -1 }
    //   // return a[1] - b[1]
    //   if (a[1] == 0) { return 1 }
    //   if (b[1] == 0) { return -1 }
    //   if (a[1] > b[1]) { return 1 }
    //   if (a[1] < b[1]) { return -1 }
    //   if (a[0] > b[0]) { return 1 }
    //   if (a[0] < b[0]) { return -1 }
    //   return 0
    // })

    let evaluatedSchedule = []

    for (let i = 0; i < 20; i++) {
      if (eventSchedule[i][1] == 0) { break; }
      let contractEvent = {
        scheduledTime: eventSchedule[i][1],
        eventType: eventSchedule[i][0],
        currency: 0,
        payOff: 0,
        actualEventTime: 0
      }

      let response = await PAMEngineDeployed.methods.getNextState(
        contractTerms, 
        contractState, 
        contractEvent, 
        contractEvent.scheduledTime
      ).call()

      contractState = response[0]
      let postEvent = response[1]

      evaluatedSchedule.push([
        new Date(postEvent.scheduledTime * 1000).toISOString(),
        postEvent.eventType,
        Math.round((postEvent.payOff * 10 ** -precision) * 10000000000000) / 10000000000000,
        Math.round((contractState.nominalValue * 10 ** -precision) * 10000000000000) / 10000000000000,
        Math.round((contractState.nominalRate * 10 ** -precision) * 10000000000000) / 10000000000000,
        Math.round((contractState.nominalAccrued * 10 ** -precision) * 10000000000000) / 10000000000000
      ])
    }

    return evaluatedSchedule
  }

  before(async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
    
    await PAMEngineArtifact.new()
    PAMEngineDeployed = new web3.eth.Contract(PAMEngine.abi, PAMEngineArtifact.address);
    
    precision = Number(await PAMEngineDeployed.methods.PRECISION().call())
    
    testTerms = await getContractTerms(precision)
    refTestResults = await getTestResults()
  })

  it('should yield the expected evaluated contract schedule for test PAM10001', async () => {
    let contractTerms = testTerms['10001']
    let evaluatedSchedule = await calculateContractEventSchedule(contractTerms)

    assert.deepEqual(evaluatedSchedule, refTestResults['10001'])
  })

  it('should yield the expected evaluated contract schedule for test PAM10002', async () => {
    let contractTerms = testTerms['10002']
    let evaluatedSchedule = await calculateContractEventSchedule(contractTerms)

    assert.deepEqual(evaluatedSchedule, refTestResults['10002'])
  })

  // requires AISDA
  // it('should yield the expected evaluated contract schedule for test PAM10003', async () => {
  //   let contractTerms = testTerms['10003']
  //   let evaluatedSchedule = await calculateContractEventSchedule(contractTerms)

  //   assert.deepEqual(evaluatedSchedule, refTestResults['10003'])
  // })

  it('should yield the expected evaluated contract schedule for test PAM10004', async () => {
    let contractTerms = testTerms['10004']
    let evaluatedSchedule = await calculateContractEventSchedule(contractTerms)

    assert.deepEqual(evaluatedSchedule, refTestResults['10004'])
  })

  // requires EOM conventions
  // it('should yield the expected evaluated contract schedule for test PAM10006', async () => {
  //   let contractTerms = testTerms['10006']
  //   let evaluatedSchedule = await calculateContractEventSchedule(contractTerms)

  //   assert.deepEqual(evaluatedSchedule, refTestResults['10006'])
  // })

  // requires EOM conventions
  // it('should yield the expected evaluated contract schedule for test PAM10007', async () => {
  //   let contractTerms = testTerms['10007']
  //   let evaluatedSchedule = await calculateContractEventSchedule(contractTerms)

  //   assert.deepEqual(evaluatedSchedule, refTestResults['10007'])
  // })

  // ...

  // accrued interest for first IP?
  it('should yield the expected evaluated contract schedule for test PAM10016', async () => {
    let contractTerms = testTerms['10016']
    let evaluatedSchedule = await calculateContractEventSchedule(contractTerms)

    assert.deepEqual(evaluatedSchedule, refTestResults['10016'])
  })

  it('should yield the expected evaluated contract schedule for test PAM10017', async () => {
    let contractTerms = testTerms['10017']
    let evaluatedSchedule = await calculateContractEventSchedule(contractTerms)

    assert.deepEqual(evaluatedSchedule, refTestResults['10017'])
  })

  it('should yield the expected evaluated contract schedule for test PAM10018', async () => {
    let contractTerms = testTerms['10018']
    let evaluatedSchedule = await calculateContractEventSchedule(contractTerms)

    assert.deepEqual(evaluatedSchedule, refTestResults['10018'])
  })

  it('should yield the expected evaluated contract schedule for test PAM10019', async () => {
    let contractTerms = testTerms['10019']
    let evaluatedSchedule = await calculateContractEventSchedule(contractTerms)

    assert.deepEqual(evaluatedSchedule, refTestResults['10019'])
  })
})
