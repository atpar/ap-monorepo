const PAMEngine = artifacts.require('PAMEngine.sol')

const { parseTermsFromPath } = require('../parser.js')
const PAMTestTermsPath = './test/contract-templates/pam-test-terms.csv'

const getTerms = () => {
  return parseTermsFromPath(PAMTestTermsPath)
}

contract('PAMEngine', () => {

  before(async () => {        
    this.PAMEngineInstance = await PAMEngine.new()

    const testTerms = await getTerms()
    this.contractTerms = testTerms['10001']
  })

  it('should yield the correct initial contract state', async () => {
    const initialState = await this.PAMEngineInstance.computeInitialState(this.contractTerms, {})

    assert.isTrue(Number(initialState['lastEventTime']) === Number(this.contractTerms['statusDate']))
  })

  it('should yield all events', async () => {
    const timestamp = 1388534400 // 30.12.2012
    const lastEventTime = 1356825600 // 01.01.2014

    let protoEventSchedule = await this.PAMEngineInstance.computeProtoEventScheduleSegment(
      this.contractTerms, 
      lastEventTime,
      timestamp
    )

    // protoEventSchedule.sort((a,b) => {
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

    protoEventSchedule = protoEventSchedule.slice(0, 30)
  })

  it('should yield correct segment of events', async () => {
    let lastEventTime = 1356825600 // 30.12.2012
    let timestamp = 1388534400 // 01.01.2014
    
    let entireProtoEventSchedule = await this.PAMEngineInstance.computeProtoEventScheduleSegment(
      this.contractTerms, 
      lastEventTime,
      timestamp
    )

    entireProtoEventSchedule.sort((a,b) => {
      if (a[1] == 0) { return 1 }
      if (b[1] == 0) { return -1 }
      if (a[1] > b[1]) { return 1 }
      if (a[1] < b[1]) { return -1 }
      if (a[0] > b[0]) { return 1 }
      if (a[0] < b[0]) { return -1 }
      return 0
    })

    entireProtoEventSchedule = entireProtoEventSchedule.slice(0, 30)


    let protoEventSchedule = []

    lastEventTime = 0 
    timestamp = 1362096000 // 01.03.2013
    response = await this.PAMEngineInstance.computeProtoEventScheduleSegment(
      this.contractTerms, 
      lastEventTime,
      timestamp
    )
    protoEventSchedule = [...response]

    lastEventTime = 1362096000 // 01.03.2013
    timestamp = 1372636800 // 01.07.2013
    response = await this.PAMEngineInstance.computeProtoEventScheduleSegment(
      this.contractTerms, 
      lastEventTime,
      timestamp
    )
    protoEventSchedule = [...protoEventSchedule, ...response]
    
    lastEventTime = 1372636800 // 01.07.2013
    timestamp = 1388534400 // 01.01.2014
    response = await this.PAMEngineInstance.computeProtoEventScheduleSegment(
      this.contractTerms, 
      lastEventTime,
      timestamp
    )
    protoEventSchedule = [...protoEventSchedule, ...response]

    protoEventSchedule.sort((a,b) => {
      if (a[1] == 0) { return 1 }
      if (b[1] == 0) { return -1 }
      if (a[1] > b[1]) { return 1 }
      if (a[1] < b[1]) { return -1 }
      if (a[0] > b[0]) { return 1 }
      if (a[0] < b[0]) { return -1 }
      return 0
    })

    protoEventSchedule = protoEventSchedule.slice(0, 30)

    assert.isTrue(protoEventSchedule.toString() === entireProtoEventSchedule.toString())
  })

  it('should yield the next next contract state and the contract events', async() => {
    const initialState = await this.PAMEngineInstance.computeInitialState(this.contractTerms, {})
    const timestamp = 1362096000 // 01.03.2013
    // const timestamp = 1388534400 // 01.01.2014
    
    await this.PAMEngineInstance.computeNextState(this.contractTerms, initialState, timestamp)
  })
})
