const Web3 = require('web3')

const PAMEngineArtifact = artifacts.require('PAMEngine.sol')
const PAMEngine = require('../../build/contracts/PAMEngine.json')

const parseContractTerms = require('../parser.js').parseContractTerms
const PAMTestTerms = './test/contract-templates/pam-test-terms.csv'

const getContractTerms = (precision) => {
  return parseContractTerms(PAMTestTerms, precision)
}

contract('PAMEngine', (accounts) => {

  let PAMEngineDeployed
  let contractTerms, contractState, eventSchedule

  before(async () => {    
    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
    
    await PAMEngineArtifact.new()
    PAMEngineDeployed = new web3.eth.Contract(PAMEngine.abi, PAMEngineArtifact.address);

    let precision = Number(await PAMEngineDeployed.methods.PRECISION().call())
    let testTerms = await getContractTerms(precision)
    contractTerms = testTerms['10001']
  })

  it('should yield the first contract state and the event schedule', async () => {
    let response = await PAMEngineDeployed.methods.getInitialState(contractTerms).call()
    contractState = response[0]
    eventSchedule = response[1]
    assert.isTrue(contractState != null && eventSchedule != null)
  })

  // it('should yield the next contract state and the next contract event', async () => {

  it('should yield all events', async () => {
    let timestamp = 1388534400 // 30.12.2012
    let lastEventTime = 1356825600 // 01.01.2014

    let response = await PAMEngineDeployed.methods.computeContractEventScheduleSegment(
      contractTerms, 
      lastEventTime,
      timestamp
    ).call()
    contractEventSchedule = response

    // contractEventSchedule.sort((a,b) => {
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

    contractEventSchedule = contractEventSchedule.slice(0, 30)
  })

  it('should yield correct segment of events', async () => {
    let lastEventTime = 1356825600 // 30.12.2012
    let timestamp = 1388534400 // 01.01.2014
    let response = await PAMEngineDeployed.methods.computeContractEventScheduleSegment(
      contractTerms, 
      lastEventTime,
      timestamp
    ).call()
    let entireContractEventSchedule = response

    entireContractEventSchedule.sort((a,b) => {
      if (a[1] == 0) { return 1 }
      if (b[1] == 0) { return -1 }
      if (a[1] > b[1]) { return 1 }
      if (a[1] < b[1]) { return -1 }
      if (a[0] > b[0]) { return 1 }
      if (a[0] < b[0]) { return -1 }
      return 0
    })

    entireContractEventSchedule = entireContractEventSchedule.slice(0, 30)


    let contractEventSchedule = []

    lastEventTime = 0 
    timestamp = 1362096000 // 01.03.2013
    response = await PAMEngineDeployed.methods.computeContractEventScheduleSegment(
      contractTerms, 
      lastEventTime,
      timestamp
    ).call()
    contractEventSchedule = [...response]

    lastEventTime = 1362096000 // 01.03.2013
    timestamp = 1372636800 // 01.07.2013
    response = await PAMEngineDeployed.methods.computeContractEventScheduleSegment(
      contractTerms, 
      lastEventTime,
      timestamp
    ).call()
    contractEventSchedule = [...contractEventSchedule, ...response]
    
    lastEventTime = 1372636800 // 01.07.2013
    timestamp = 1388534400 // 01.01.2014
    response = await PAMEngineDeployed.methods.computeContractEventScheduleSegment(
      contractTerms, 
      lastEventTime,
      timestamp
    ).call()
    contractEventSchedule = [...contractEventSchedule, ...response]

    contractEventSchedule.sort((a,b) => {
      if (a[1] == 0) { return 1 }
      if (b[1] == 0) { return -1 }
      if (a[1] > b[1]) { return 1 }
      if (a[1] < b[1]) { return -1 }
      if (a[0] > b[0]) { return 1 }
      if (a[0] < b[0]) { return -1 }
      return 0
    })

    contractEventSchedule = contractEventSchedule.slice(0, 30)

    assert.isTrue(contractEventSchedule.toString() === entireContractEventSchedule.toString())
  })

  it('should yield the next next contract state and the contract events', async() => {
    let response = await PAMEngineDeployed.methods.getInitialState(contractTerms).call()
    contractState = response[0]
    
    let timestamp = 1362096000 // 01.03.2013
    // let timestamp = 1388534400 // 01.01.2014

    response = await PAMEngineDeployed.methods.getNextState(contractTerms, contractState, timestamp).call()
  })
})
