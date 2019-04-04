const fs = require('fs')

const PAMEngine = artifacts.require('PAMEngine.sol')

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

  before(async () => {    
    this.PAMEngineInstance = await PAMEngine.new()
    
    this.PRECISION = Number(await this.PAMEngineInstance.PRECISION())
    
    this.testTerms = await getContractTerms(this.PRECISION)
    this.refTestResults = await getTestResults()
  })

  const evaluateEventSchedule = async (contractTerms) => {
    const initialContractState = await this.PAMEngineInstance.computeInitialState(contractTerms, {})
    const protoEventSchedule = await this.PAMEngineInstance.computeProtoEventScheduleSegment(
      contractTerms,
      contractTerms.statusDate,
      contractTerms.maturityDate
    )

    const evaluatedSchedule = []
    let contractState = initialContractState

    for (let i = 0; i < 20; i++) {
      if (protoEventSchedule[i].scheduledTime == 0) { break; }
      const { 0: nextContractState, 1: contractEvent } = await this.PAMEngineInstance.computeNextStateForProtoEvent(
        contractTerms, 
        contractState, 
        protoEventSchedule[i], 
        protoEventSchedule[i].scheduledTime
      )

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