const Web3 = require('web3')
const fs = require('fs')

const PAMEngineTruffleArtifact = artifacts.require('PAMEngine.sol')
const PAMEngineArtifact = require('../../build/contracts/PAMEngine.json')

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

  const evaluateEventSchedule = async (contractTerms) => {
    const initialContractState = await this.PAMEngine.methods.computeInitialState(contractTerms).call()
    const protoEventSchedule = await this.PAMEngine.methods.computeProtoEventScheduleSegment(
      contractTerms,
      contractTerms.statusDate,
      contractTerms.maturityDate
    ).call()
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

    const evaluatedSchedule = []
    let contractState = initialContractState

    for (let i = 0; i < 20; i++) {
      if (protoEventSchedule[i].scheduledTime == 0) { break; }
      const { 0: nextContractState, 1: contractEvent } = await this.PAMEngine.methods.computeNextStateForProtoEvent(
        contractTerms, 
        contractState, 
        protoEventSchedule[i], 
        protoEventSchedule[i].scheduledTime
      ).call()

      contractState = nextContractState

      evaluatedSchedule.push([
        new Date(contractEvent.scheduledTime * 1000).toISOString(),
        contractEvent.eventType,
        Math.round((contractEvent.payoff * 10 ** -this.PRECISION) * 10000000000000) / 10000000000000,
        Math.round((contractState.nominalValue * 10 ** -this.PRECISION) * 10000000000000) / 10000000000000,
        Math.round((contractState.nominalRate * 10 ** -this.PRECISION) * 10000000000000) / 10000000000000,
        Math.round((contractState.nominalAccrued * 10 ** -this.PRECISION) * 10000000000000) / 10000000000000
      ])
    }

    return evaluatedSchedule
  }

  before(async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
    
    await PAMEngineTruffleArtifact.new()
    this.PAMEngine = new web3.eth.Contract(PAMEngineArtifact.abi, PAMEngineTruffleArtifact.address);
    
    this.PRECISION = Number(await this.PAMEngine.methods.PRECISION().call())
    
    this.testTerms = await getContractTerms(this.PRECISION)
    this.refTestResults = await getTestResults()
  })

  it('should yield the expected evaluated contract schedule for test PAM10001', async () => {
    const contractTerms = this.testTerms['10001']
    const evaluatedSchedule = await evaluateEventSchedule(contractTerms)

    assert.deepEqual(evaluatedSchedule, this.refTestResults['10001'])
  })

  it('should yield the expected evaluated contract schedule for test PAM10002', async () => {
    const contractTerms = this.testTerms['10002']
    const evaluatedSchedule = await evaluateEventSchedule(contractTerms)

    assert.deepEqual(evaluatedSchedule, this.refTestResults['10002'])
  })

  // requires AISDA
  // it('should yield the expected evaluated contract schedule for test PAM10003', async () => {
  //   const contractTerms = this.testTerms['10003']
  //   const evaluatedSchedule = await evaluateEventSchedule(contractTerms)

  //   assert.deepEqual(evaluatedSchedule, this.refTestResults['10003'])
  // })

  it('should yield the expected evaluated contract schedule for test PAM10004', async () => {
    const contractTerms = this.testTerms['10004']
    const evaluatedSchedule = await evaluateEventSchedule(contractTerms)

    assert.deepEqual(evaluatedSchedule, this.refTestResults['10004'])
  })

  // requires EOM conventions
  // it('should yield the expected evaluated contract schedule for test PAM10006', async () => {
  //   const contractTerms = this.testTerms['10006']
  //   const evaluatedSchedule = await evaluateEventSchedule(contractTerms)

  //   assert.deepEqual(evaluatedSchedule, this.refTestResults['10006'])
  // })

  // requires EOM conventions
  // it('should yield the expected evaluated contract schedule for test PAM10007', async () => {
  //   const contractTerms = this.testTerms['10007']
  //   const evaluatedSchedule = await evaluateEventSchedule(contractTerms)

  //   assert.deepEqual(evaluatedSchedule, this.refTestResults['10007'])
  // })

  // ...

  // accrued interest for first IP?
  it('should yield the expected evaluated contract schedule for test PAM10016', async () => {
    const contractTerms = this.testTerms['10016']
    const evaluatedSchedule = await evaluateEventSchedule(contractTerms)

    assert.deepEqual(evaluatedSchedule, this.refTestResults['10016'])
  })

  it('should yield the expected evaluated contract schedule for test PAM10017', async () => {
    const contractTerms = this.testTerms['10017']
    const evaluatedSchedule = await evaluateEventSchedule(contractTerms)

    assert.deepEqual(evaluatedSchedule, this.refTestResults['10017'])
  })

  it('should yield the expected evaluated contract schedule for test PAM10018', async () => {
    const contractTerms = this.testTerms['10018']
    const evaluatedSchedule = await evaluateEventSchedule(contractTerms)

    assert.deepEqual(evaluatedSchedule, this.refTestResults['10018'])
  })

  it('should yield the expected evaluated contract schedule for test PAM10019', async () => {
    const contractTerms = this.testTerms['10019']
    const evaluatedSchedule = await evaluateEventSchedule(contractTerms)

    assert.deepEqual(evaluatedSchedule, this.refTestResults['10019'])
  })
})
