// const Web3 = require('web3')
// const BigNumber = require('bignumber.js')

// const PAMStatelessContractArtifact = artifacts.require('PAMStatelessContract.sol')
// const PAMStatelessContract = require('../build/contracts/PAMStatelessContract.json')
// // const PAMStatefulContractOffChainArtifact = artifacts.require('PAMStatefulContractOffChain.sol')
// const PAMStatefulContractOffChain = require('../build/contracts/PAMStatefulContractOffChain.json')

// const parseContractTerms = require('./parser.js').parseContractTerms
// const PAMTestTerms = './test/contract-templates/pam-test-terms.csv'

// const getContractTerms = (precision) => parseContractTerms(PAMTestTerms, precision)

// const getContractUpdateAsTypedData = (contractUpdate, verifyingContract, chainId) => {
//   const typedData = {
//     domain: {
//       name: 'Actus Financial Protocol',
//       version: '1',
//       chainId: 0,
//       verifyingContract: verifyingContract
//     },
//     types: {
//       EIP712Domain: [
//         { name: 'name', type: 'string' },
//         { name: 'version', type: 'string' },
//         { name: 'chainId', type: 'uint256' },
//         { name: 'verifyingContract', type: 'address' }
//       ],
//       ContractUpdate: [
//         { name: 'assetId', type: 'bytes32' },
//         { name: 'recordCreatorAddress', type: 'address' },
//         { name: 'counterpartyAddress', type: 'address' },
//         { name: 'contractAddress', type: 'address' },
//         { name: 'contractTermsHash', type: 'bytes32' },
//         { name: 'contractStateHash', type: 'bytes32' },
//         { name: 'contractUpdateNonce', type: 'uint256' }
//       ]
//     },
//     primaryType: 'ContractUpdate',
//     message: {
//       assetId: contractUpdate.assetId,
//       recordCreatorAddress: contractUpdate.recordCreatorAddress,
//       counterpartyAddress: contractUpdate.counterpartyAddress,
//       contractAddress: contractUpdate.contractAddress,
//       contractTermsHash: contractUpdate.contractTermsHash,
//       contractStateHash: contractUpdate.contractStateHash,
//       contractUpdateNonce: contractUpdate.contractUpdateNonce
//     }
//   }
//   return typedData
// }

// const signContractUpdate = (typedData, account) => {
//   return new Promise((resolve, reject) => {
//     web3.currentProvider.send({
//       method: 'eth_signTypedData',
//       params: [account, typedData],
//       from: account,
//       id: new Date().getSeconds()
//     }, (error, result) => {
//       if (error) { return reject(error) }
//       resolve(result)
//     })
//   })
// }

// contract('PAMStatefulContractOffChain', (accounts) => {

//   let PAMStatefulContractOffChainDeployed
//   let contractTerms, contractState
//   let precision

//   const recordCreatorAddress = accounts[0]
//   const counterpartyAddress = accounts[1]
  
//   before(async () => {
//     const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));

//     // deploy PAMStatelessContract
//     const PAMStatelessContractInstance = await PAMStatelessContractArtifact.new()
//     PAMStatelessContractDeployed = new web3.eth.Contract(PAMStatelessContract.abi, PAMStatelessContractInstance.address);
    
//     // get precision
//     precision = Number(await PAMStatelessContractDeployed.methods.precision().call())

//     // get contract test terms
//     let testTerms = await getContractTerms(precision)

//     // select terms of the first test
//     contractTerms = testTerms['10001']
    
//     // deploy PAMStatefulContractOffChain
//     // const PAMStatefulContractOffChainInstance = await PAMStatefulContractOffChainArtifact.new(
//     //   recordCreatorAddress, 
//     //   counterpartyAddress,
//     // )
//     // PAMStatefulContractOffChainDeployed = new web3.eth.Contract(
//     //   PAMStatefulContractOffChain.abi, 
//     //   PAMStatefulContractOffChainInstance.address
//     // )
//   })

//   it('should register the first contractUpdate with the contract terms and the initial contract state', async () => {
//     ({ 0: contractState } = await PAMStatelessContractDeployed.methods.getInitialState(contractTerms).call())
    
//     const assetId = 'PAM' + Math.floor(new Date().getTime() / 1000)
//     const extractedContractStateObject = Object.keys(contractState).filter((key) => (!(/^\d+/).test(key)))  
//       .reduce((obj, key) => { obj[key] = contractState[key]; return obj }, {})
    
//     const contractUpdate = {
//       assetId: web3.utils.toHex(assetId),
//       recordCreatorAddress: recordCreatorAddress,
//       counterpartyAddress: counterpartyAddress,
//       contractAddress: '0x0000000000000000000000000000000000000000',
//       contractTermsHash: web3.utils.keccak256(JSON.stringify(contractTerms)),
//       contractStateHash: web3.utils.keccak256(JSON.stringify(extractedContractStateObject)),
//       contractUpdateNonce: 0
//     }

//     const chainId = await web3.eth.net.getId()
//     const verifyingContract = '0x0000000000000000000000000000000000000000'
//     const typedData = getContractUpdateAsTypedData(contractUpdate, verifyingContract, chainId)

//     const { result: recordCreatorSignature } = await signContractUpdate(
//       typedData,
//       recordCreatorAddress
//     )
//     const { result: counterpartySignature } = await signContractUpdate(
//       typedData,
//       counterpartyAddress
//     )

//     // const constractEvents = [
//     //   ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'],
//     //   ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'],
//     //   ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'],
//     //   ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'],
//     //   ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'],
//     //   ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0'], ['0', '0', '0', '0', '0']
//     // ]

//     // const response = await PAMStatefulContractOffChainDeployed.methods.registerContractUpdate(
//     //   contractUpdate,
//     //   recordCreatorSignature,
//     //   counterpartySignature,
//     //   constractEvents
//     // ).send({from: recordCreatorAddress, gas: 300000, value: web3.utils.toHex(0)})

//     const contract = new web3.eth.Contract(PAMStatefulContractOffChain.abi)
//     // const { options: { address } } = await contract.deploy({
//     //   data: PAMStatefulContractOffChain.bytecode,
//     //   arguments: [
//     //     contractUpdate,
//     //     recordCreatorSignature,
//     //     counterpartySignature,
//     //   ]
//     // }).send({ from: recordCreatorAddress })

//     console.log(web3.version)

//     const response = await contract.deploy({
//       data: PAMStatefulContractOffChain.bytecode,
//       arguments: [
//         contractUpdate,
//         recordCreatorSignature,
//         counterpartySignature,
//       ]
//     }).send({ from: recordCreatorAddress })

//     console.log(response)

//     PAMStatefulContractOffChainDeployed = new web3.eth.Contract(
//       PAMStatefulContractOffChain.abi, 
//       address
//     )
//   })

//   it('should register the next contractUpdates', async () => {
//     ({ 0: contractState, 1: contractEvents } = await PAMStatelessContractDeployed.methods.getNextState(
//       contractTerms,
//       contractState, 
//       1367366400
//     ).call())

//     const assetId = await PAMStatefulContractOffChainDeployed.methods.assetId().call()
  
//     const extractedContractStateObject = Object.keys(contractState).filter((key) => (!(/^\d+/).test(key)))  
//       .reduce((obj, key) => { obj[key] = contractState[key]; return obj }, {})
    
//     const contractUpdate = {
//       assetId: web3.utils.toHex(assetId),
//       recordCreatorAddress: recordCreatorAddress,
//       counterpartyAddress: counterpartyAddress,
//       contractAddress: PAMStatefulContractOffChainDeployed.options.address,
//       contractTermsHash: web3.utils.keccak256(JSON.stringify(contractTerms)),
//       contractStateHash: web3.utils.keccak256(JSON.stringify(extractedContractStateObject)),
//       contractUpdateNonce: 1
//     }

//     const chainId = await web3.eth.net.getId()
//     const verifyingContract = PAMStatefulContractOffChainDeployed.options.address
//     const typedData = getContractUpdateAsTypedData(contractUpdate, verifyingContract, chainId)

//     const { result: recordCreatorSignature } = await signContractUpdate(
//       typedData,
//       recordCreatorAddress
//     )
//     const { result: counterpartySignature } = await signContractUpdate(
//       typedData,
//       counterpartyAddress
//     )

//     let payOff = new BigNumber(0)
//     Object.values(contractEvents).forEach((contractEvent) => payOff = payOff.plus(contractEvent.payOff))

//     const counterpartyBalanceBefore = new BigNumber(await web3.eth.getBalance(counterpartyAddress))
    
//     const response = await PAMStatefulContractOffChainDeployed.methods.registerContractUpdate(
//       contractUpdate,
//       recordCreatorSignature,
//       counterpartySignature,
//       contractEvents
//     ).send({
//       from: (payOff.isLessThan(0)) ? recordCreatorAddress : counterpartyAddress, 
//       gas: 250000, 
//       value: web3.utils.toHex(payOff.absoluteValue())
//     })

//     const counterpartyBalanceAfter = new BigNumber(await web3.eth.getBalance(counterpartyAddress))
    
//     assert.isTrue(
//       counterpartyBalanceBefore
//         .plus(payOff.absoluteValue())
//         .isEqualTo(counterpartyBalanceAfter)
//     )
//   })
// })