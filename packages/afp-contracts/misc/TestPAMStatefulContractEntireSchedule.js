// const Web3 = require('web3')

// const CustomTokenArtifact = artifacts.require('CustomToken.sol')
// const PAMStatelessContractArtifact = artifacts.require('PAMStatelessContract.sol')
// const PAMStatelessContract = require('../build/contracts/PAMStatelessContract.json')
// const PAMStatefulContractArtifact = artifacts.require('PAMStatefulContractv1.sol')
// const PAMStatefulContract = require('../build/contracts/PAMStatefulContractv1.json')

// const parseContractTerms = require('./parser.js').parseContractTerms
// const PAMTestTerms = './test/contract-templates/pam-test-terms.csv'

// const getContractTerms = (precision) => {
//   return parseContractTerms(PAMTestTerms, precision)
// }

// contract('PAMStatefulContractv1', (accounts) => {

//   let PAMStatefulContractDeployed
//   let contractTerms, contractState, eventSchedule

//   before(async () => {
//     const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));

//     await PAMStatelessContractArtifact.new()
//     await CustomTokenArtifact.new('CustomToken', 'TKN', 8, 1000000)
//     await PAMStatefulContractArtifact.new(
//       PAMStatelessContractArtifact.address, 
//       accounts[0], 
//       accounts[1], 
//       CustomTokenArtifact.address
//     )

//     PAMStatelessContractDeployed = new web3.eth.Contract(PAMStatelessContract.abi, PAMStatelessContractArtifact.address);
//     PAMStatefulContractDeployed = new web3.eth.Contract(PAMStatefulContract.abi, PAMStatefulContractArtifact.address);

//     let precision = Number(await PAMStatelessContractDeployed.methods.precision().call())
//     let testTerms = await getContractTerms(precision)
//     contractTerms = testTerms['10001']
//   })

//   it('should yield the first contract state and the event schedule', async () => {
//     await PAMStatefulContractDeployed.methods.initializeContract(contractTerms)
//     .send({from: accounts[0], gas: 2000000})
//     // .on('receipt', (receipt) => { console.log(receipt) })

//     eventSchedule = await PAMStatefulContractDeployed.methods.getEventSchedule().call()
//     contractState = await PAMStatefulContractDeployed.methods.contractState().call()
//     // console.log(await PAMStatefulContractDeployed.methods.getContractTerms().call())
//     assert.isTrue(contractState != null && eventSchedule != null)
//   })

//   it('should yield the next contract state and the next contract event', async () => {
//     let tx = await PAMStatefulContractDeployed.methods.getNextState()
//     .send({from: accounts[0], gas: 200000})
//     // .on('receipt', (receipt) => { console.log(receipt) })
//     assert.isTrue(tx.events.Event.event === 'Event')
//   })
// })