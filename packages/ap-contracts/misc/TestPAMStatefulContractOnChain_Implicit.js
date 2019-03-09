const Web3 = require('web3')
const BigNumber = require('bignumber.js')

const CustomTokenArtifact = artifacts.require('CustomToken.sol')
const PAMStatelessContractArtifact = artifacts.require('PAMStatelessContract.sol')
const PAMStatelessContract = require('../build/contracts/PAMStatelessContract.json')
const PAMStatefulContractOnChain_ImplicitArtifact = artifacts.require('PAMStatefulContractOnChain_Implicit.sol')
const PAMStatefulContractOnChain_Implicit = require('../build/contracts/PAMStatefulContractOnChain_Implicit.json')

const parseContractTerms = require('./parser.js').parseContractTerms
const PAMTestTerms = './test/contract-templates/pam-test-terms.csv'

const getContractTerms = (precision) => {
  return parseContractTerms(PAMTestTerms, precision)
}

contract('PAMStatefulContractOnChain_Implicit', (accounts) => {

  let PAMStatefulContractOnChain_ImplicitDeployed
  let contractTerms
  let precision
  
  before(async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));

    const PAMStatelessContractInstance = await PAMStatelessContractArtifact.new()
    PAMStatelessContractDeployed = new web3.eth.Contract(PAMStatelessContract.abi, PAMStatelessContractInstance.address);

    precision = Number(await PAMStatelessContractDeployed.methods.precision().call())
    const testTerms = await getContractTerms(precision)
    contractTerms = testTerms['10001']

    const CustomTokenInstance = await CustomTokenArtifact.new('CustomToken', 'TKN', 8, 1000000)

    const PAMStatefulContractOnChain_ImplicitInstance = await PAMStatefulContractOnChain_ImplicitArtifact.new(
      PAMStatelessContractInstance.address, 
      accounts[0], 
      accounts[1], 
      CustomTokenInstance.address
    )

    PAMStatefulContractOnChain_ImplicitDeployed = new web3.eth.Contract(
      PAMStatefulContractOnChain_Implicit.abi, 
      PAMStatefulContractOnChain_ImplicitInstance.address
    );
  })

  it('should yield the first contract state and the event schedule', async () => {
    await PAMStatefulContractOnChain_ImplicitDeployed.methods.initialize(contractTerms, 86400, 7*86400)
    .send({from: accounts[0], gas: 2000000})
    const contractEventSchedule = await PAMStatefulContractOnChain_ImplicitDeployed.methods.getContractEventSchedule().call()
    assert.isTrue(contractEventSchedule[0][0] != '')
  })

  it('should process principal payment, emit contract event and yield the next contract state ', async () => {
    const preBalanceRecordCreator = new BigNumber(await web3.eth.getBalance(accounts[0]))
    const preBalanceCounterparty = new BigNumber(await web3.eth.getBalance(accounts[1]))

    const contractEventSchedule = await PAMStatefulContractOnChain_ImplicitDeployed.methods.getContractEventSchedule().call()
    const contractEventScheduleTimestamps = []

    for (let i = 0; i < contractEventSchedule.length; i++) {
      if (contractEventScheduleTimestamps[i-1] === contractEventSchedule[i][1]) {
        continue
      }
      if (contractEventSchedule[i][1] === '0') { break }  
      contractEventScheduleTimestamps.push(contractEventSchedule[i][1])
    }

    let counterpartyPayOffSummed = new BigNumber(0)
    
    for (let i = 0; i < contractEventScheduleTimestamps.length; i++) {     
      const payOff = new BigNumber(await PAMStatefulContractOnChain_ImplicitDeployed.methods.getOutstandingPayOff(
        contractEventScheduleTimestamps[i]
      ).call())

      const value = (payOff.isLessThan(0)) ? payOff.negated() : payOff

      await PAMStatefulContractOnChain_ImplicitDeployed.methods.settleOutstandingPayOff(
        contractEventScheduleTimestamps[i]
      ).send({
        from: (payOff.isLessThan(0)) ? accounts[0] : accounts[1], 
        gas: 450000, 
        value: value
      })
      // .on('receipt', (receipt) => { console.log(receipt.events) })

      // console.log('payOff for period: ' + payOff.shiftedBy(-precision).toString())
      counterpartyPayOffSummed = counterpartyPayOffSummed.plus(payOff)

      i++
    }

    const postBalanceRecordCreator = new BigNumber(await web3.eth.getBalance(accounts[0]))
    const postBalanceCounterparty = new BigNumber(await web3.eth.getBalance(accounts[1]))

    // console.log('summed payoff: ' + counterpartyPayOffSummed.shiftedBy(-precision).toString())
    // console.log('preBalanceCounterparty: ' + preBalanceCounterparty.shiftedBy(-precision).toString())
    // console.log('postBalanceCounterparty: ' + postBalanceCounterparty.shiftedBy(-precision).toString())

    assert.isTrue(postBalanceRecordCreator.isGreaterThan(preBalanceRecordCreator) && postBalanceCounterparty.isLessThan(preBalanceCounterparty))
    // console.log(preBalanceCounterparty.minus(counterpartyPayOffSummed).shiftedBy(-precision).toString())
  })
})