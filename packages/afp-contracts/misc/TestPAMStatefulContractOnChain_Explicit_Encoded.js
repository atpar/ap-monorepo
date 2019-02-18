const Web3 = require('web3')
const BigNumber = require('bignumber.js')

const CustomTokenArtifact = artifacts.require('CustomToken.sol')
const PAMStatelessContractArtifact = artifacts.require('PAMStatelessContract.sol')
const PAMStatelessContract = require('../build/contracts/PAMStatelessContract.json')
const PAMStatefulContractOnChain_Explicit_EncodedArtifact = artifacts.require('PAMStatefulContractOnChain_Explicit_Encoded.sol')
const PAMStatefulContractOnChain_Explicit_Encoded = require('../build/contracts/PAMStatefulContractOnChain_Explicit_Encoded.json')

const parseContractTerms = require('./parser.js').parseContractTerms
const PAMTestTerms = './test/contract-templates/pam-test-terms.csv'

const getContractTerms = (precision) => {
  return parseContractTerms(PAMTestTerms, precision)
}

contract('PAMStatefulContractOnChain_Explicit_Encoded', (accounts) => {

  let PAMStatefulContractOnChain_Explicit_EncodedDeployed
  let contractTerms
  let precision
  
  before(async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));

    const PAMStatelessContractInstance = await PAMStatelessContractArtifact.new()
    PAMStatelessContractDeployed = new web3.eth.Contract(PAMStatelessContract.abi, PAMStatelessContractInstance.address);

    precision = Number(await PAMStatelessContractDeployed.methods.precision().call())
    let testTerms = await getContractTerms(precision)
    contractTerms = testTerms['10001']

    const CustomTokenInstance = await CustomTokenArtifact.new('CustomToken', 'TKN', 8, 1000000)
    
    const PAMStatefulContractOnChain_Explicit_EncodedInstance = await PAMStatefulContractOnChain_Explicit_EncodedArtifact.new(
      PAMStatelessContractInstance.address, 
      accounts[0], 
      accounts[1], 
      CustomTokenInstance.address
    )

    PAMStatefulContractOnChain_Explicit_EncodedDeployed = new web3.eth.Contract(PAMStatefulContractOnChain_Explicit_Encoded.abi, PAMStatefulContractOnChain_Explicit_EncodedInstance.address);

    // PAMStatefulContractOnChainDeployed = new web3.eth.Contract(PAMStatefulContractOnChain.abi);
    // PAMStatefulContractOnChainDeployed = await PAMStatefulContractOnChainDeployed.deploy({
    //   data: PAMStatefulContractOnChain.bytecode,
    //   arguments: [
    //     PAMStatelessContractArtifact.address, 
    //     accounts[0], 
    //     accounts[1], 
    //     CustomTokenArtifact.address
    //   ]
    // }).send({from: accounts[0]})
  })

  it('should yield the first contract state and the event schedule', async () => {
    await PAMStatefulContractOnChain_Explicit_EncodedDeployed.methods.initialize(contractTerms, 86400, 7*86400)
    .send({from: accounts[0], gas: 2000000})
    // .on('receipt', (receipt) => { console.log(receipt) })
    const contractEventSchedule = await PAMStatefulContractOnChain_Explicit_EncodedDeployed.methods.getContractEventSchedule().call()
    assert.isTrue(contractEventSchedule[0][0] != '')
  })

  it('should process principal payment, emit contract event and yield the next contract state ', async () => {
    const preBalance = new BigNumber(await web3.eth.getBalance(accounts[1]))
    const value = new BigNumber(3000).shiftedBy(precision)

    await PAMStatefulContractOnChain_Explicit_EncodedDeployed.methods.payPrincipal(contractTerms.initialExchangeDate)
    .send({from: accounts[0], gas: 200000, value: web3.utils.toHex(value)})

    const postBalance = new BigNumber(await web3.eth.getBalance(accounts[1]))

    assert.isTrue(preBalance.plus(value).toString() === postBalance.toString())
  })

  it('should process all interest payments, emit the contract events and yield the resulting contract state ', async () => {
    const preBalance = new BigNumber(await web3.eth.getBalance(accounts[0]))
    const contractEventSchedule = await PAMStatefulContractOnChain_Explicit_EncodedDeployed.methods.getContractEventSchedule().call()
    
    let contractState = await PAMStatefulContractOnChain_Explicit_EncodedDeployed.methods.getContractState().call()
    let contractEventScheduleIndex = await PAMStatefulContractOnChain_Explicit_EncodedDeployed.methods.getContractEventScheduleIndex().call()
    let summedPayOff = new BigNumber(0)

    while(contractEventSchedule[contractEventScheduleIndex][0] === '4') {
      const contractEvent = {
        scheduledTime: contractEventSchedule[contractEventScheduleIndex][1],
        eventType: contractEventSchedule[contractEventScheduleIndex][0],
        currency: 0,
        payOff: 0,
        actualEventTime: 0
      }

      const response = await PAMStatelessContractDeployed.methods.getNextState(
        contractTerms,
        contractState,
        contractEvent,
        contractEvent.scheduledTime
      ).call()

      contractState = response[0]
      const evaluatedContractEvent = response[1]
      const value = new BigNumber(evaluatedContractEvent.payOff)
      
      await PAMStatefulContractOnChain_Explicit_EncodedDeployed.methods.payInterest(contractEvent.scheduledTime)
      .send({from: accounts[1], gas: 200000, value: value})
      
      contractEventScheduleIndex++
      summedPayOff = summedPayOff.plus(value)
    }  
    
    const postBalance = new BigNumber(await web3.eth.getBalance(accounts[0]))
    assert.isTrue(preBalance.plus(summedPayOff).toString() === postBalance.toString())
  })

  it('should redeem principal, emit contract event and yield the next contract state ', async () => {
    const preBalance = new BigNumber(await web3.eth.getBalance(accounts[0]))
    const value = new BigNumber(3000).shiftedBy(precision)

    await PAMStatefulContractOnChain_Explicit_EncodedDeployed.methods.redeemPrinicipal(contractTerms.maturityDate)
    .send({from: accounts[1], gas: 200000, value: web3.utils.toHex(value)})
    // .on('receipt', (receipt) => { console.log(receipt) })

    const postBalance = new BigNumber(await web3.eth.getBalance(accounts[0]))

    assert.isTrue(preBalance.plus(value).toString() === postBalance.toString())
  })
})