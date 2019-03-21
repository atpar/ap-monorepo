const Web3 = require('web3')

const PAMEngineTruffleArtifact = artifacts.require('PAMEngine.sol')
const PAMEngineArtifact = require('../../build/contracts/PAMEngine.json')

const parseContractTerms = require('../parser.js').parseContractTerms
const PAMTestTerms = './test/contract-templates/pam-test-terms.csv'

const getContractTerms = (precision) => {
  return parseContractTerms(PAMTestTerms, precision)
}

contract('PAMEngine', () => {

  before(async () => {    
    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
    
    await PAMEngineTruffleArtifact.new()
    this.PAMEngine = new web3.eth.Contract(PAMEngineArtifact.abi, PAMEngineTruffleArtifact.address);

    const PRECISION = Number(await this.PAMEngine.methods.PRECISION().call())
    const testTerms = await getContractTerms(PRECISION)
    this.contractTerms = testTerms['10001']
  })

  it('should yield the first contract state and the event schedule', async () => {
    const response = await this.PAMEngine.methods.computeInitialState(this.contractTerms).call()
    this.contractState = response[0]
    this.protoEventSchedule = response[1]
    assert.isTrue(this.contractState != null && this.protoEventSchedule != null)
  })

  // it('should yield the next contract state and the next contract event', async () => {

  it('should yield all events', async () => {
    const timestamp = 1388534400 // 30.12.2012
    const lastEventTime = 1356825600 // 01.01.2014

    let protoEventSchedule = await this.PAMEngine.methods.computeProtoEventScheduleSegment(
      this.contractTerms, 
      lastEventTime,
      timestamp
    ).call()

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
    
    let entireProtoEventSchedule = await this.PAMEngine.methods.computeProtoEventScheduleSegment(
      this.contractTerms, 
      lastEventTime,
      timestamp
    ).call()

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
    response = await this.PAMEngine.methods.computeProtoEventScheduleSegment(
      this.contractTerms, 
      lastEventTime,
      timestamp
    ).call()
    protoEventSchedule = [...response]

    lastEventTime = 1362096000 // 01.03.2013
    timestamp = 1372636800 // 01.07.2013
    response = await this.PAMEngine.methods.computeProtoEventScheduleSegment(
      this.contractTerms, 
      lastEventTime,
      timestamp
    ).call()
    protoEventSchedule = [...protoEventSchedule, ...response]
    
    lastEventTime = 1372636800 // 01.07.2013
    timestamp = 1388534400 // 01.01.2014
    response = await this.PAMEngine.methods.computeProtoEventScheduleSegment(
      this.contractTerms, 
      lastEventTime,
      timestamp
    ).call()
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
    this.contractState= await this.PAMEngine.methods.computeInitialState(this.contractTerms).call()
    const timestamp = 1362096000 // 01.03.2013
    // const timestamp = 1388534400 // 01.01.2014

    await this.PAMEngine.methods.computeNextState(this.contractTerms, this.contractState, timestamp).call()
  })
})
