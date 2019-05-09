const PAMEngine = artifacts.require('PAMEngine.sol')

const { getDefaultTerms } = require('../helper/tests')
const { removeNullEvents } = require('../helper/schedule')


contract('PAMEngine', () => {

  before(async () => {        
    this.PAMEngineInstance = await PAMEngine.new()
    this.terms = await getDefaultTerms()
  })

  it('should yield the initial contract state', async () => {
    const initialState = await this.PAMEngineInstance.computeInitialState(this.terms, {})

    assert.isTrue(Number(initialState['lastEventTime']) === Number(this.terms['statusDate']))
  })

  it('should yield all events', async () => {
    let protoEventSchedule = await this.PAMEngineInstance.computeProtoEventScheduleSegment(
      this.terms, 
      this.terms['statusDate'],
      this.terms['maturityDate'],
    )

    assert.isTrue(removeNullEvents(protoEventSchedule).length > 0)
  })

  it('should yield correct segment of events', async () => {
    const entireProtoEventSchedule = removeNullEvents(
      await this.PAMEngineInstance.computeProtoEventScheduleSegment(
        this.terms, 
        this.terms['statusDate'],
        this.terms['maturityDate'],
      )
    )


    let protoEventSchedule = []
    let lastEventTime = this.terms['statusDate'] 
    let timestamp = this.terms['statusDate'] + (this.terms['maturityDate'] - this.terms['statusDate']) / 4

    response = await this.PAMEngineInstance.computeProtoEventScheduleSegment(
      this.terms, 
      lastEventTime,
      timestamp
    )
    protoEventSchedule = [...response]

    lastEventTime = timestamp
    timestamp = this.terms['statusDate'] + (this.terms['maturityDate'] - this.terms['statusDate']) / 2

    response = await this.PAMEngineInstance.computeProtoEventScheduleSegment(
      this.terms, 
      lastEventTime,
      timestamp
    )
    protoEventSchedule = [...protoEventSchedule, ...response]
    
    lastEventTime = timestamp
    timestamp = this.terms['maturityDate']

    response = await this.PAMEngineInstance.computeProtoEventScheduleSegment(
      this.terms, 
      lastEventTime,
      timestamp
    )
    protoEventSchedule = [...protoEventSchedule, ...response]
    
    protoEventSchedule = removeNullEvents(protoEventSchedule)
    
    assert.isTrue(protoEventSchedule.toString() === entireProtoEventSchedule.toString())
  })

  it('should yield the next next contract state and the contract events', async() => {
    const initialState = await this.PAMEngineInstance.computeInitialState(this.terms, {})
    await this.PAMEngineInstance.computeNextState(this.terms, initialState, this.terms['maturityDate'])
  })
})
