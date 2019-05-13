const PAMEngine = artifacts.require('PAMEngine.sol')

const { getTestCases, getTestResults, toTestEvent } = require('../helper/tests')


contract('PAMEngine', () => {

  before(async () => {    
    this.PAMEngineInstance = await PAMEngine.new()
    this.testTerms = await getTestCases()
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

      evaluatedSchedule.push(toTestEvent(contractEvent, contractState))
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
  it('should yield the expected evaluated contract schedule for test PAM10006', async () => {
    const contractTerms = this.testTerms['10006']
    const evaluatedSchedule = await evaluateEventSchedule(contractTerms)

    console.log(evaluatedSchedule)
    // assert.deepEqual(evaluatedSchedule, this.refTestResults['10006'])
  })

  // requires EOM conventions
  it('should yield the expected evaluated contract schedule for test PAM10007', async () => {
    const contractTerms = this.testTerms['10007']
    const evaluatedSchedule = await evaluateEventSchedule(contractTerms)


    console.log(evaluatedSchedule)
    // assert.deepEqual(evaluatedSchedule, this.refTestResults['10007'])
  })

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
