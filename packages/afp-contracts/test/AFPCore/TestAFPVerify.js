const Web3 = require('web3')
const sigUtil = require('eth-sig-util')

const AFPVerifyArtifact = artifacts.require('AFPVerify.sol')
const AFPVerify = require('../../build/contracts/AFPVerify.json')

const getContractUpdateAsTypedData = (contractUpdate, verifyingContract, chainId) => {
  const typedData = {
    domain: {
      name: 'Actus Financial Protocol',
      version: '1',
      chainId: 0,
      verifyingContract: verifyingContract
    },
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      ContractUpdate: [
        { name: 'contractId', type: 'bytes32' },
        { name: 'recordCreatorAddress', type: 'address' },
        { name: 'counterpartyAddress', type: 'address' },
        { name: 'contractAddress', type: 'address' },
        { name: 'contractTermsHash', type: 'bytes32' },
        { name: 'contractStateHash', type: 'bytes32' },
        { name: 'contractUpdateNonce', type: 'uint256' }
      ]
    },
    primaryType: 'ContractUpdate',
    message: {
      contractId: contractUpdate.contractId,
      recordCreatorAddress: contractUpdate.recordCreatorAddress,
      counterpartyAddress: contractUpdate.counterpartyAddress,
      contractAddress: contractUpdate.contractAddress,
      contractTermsHash: contractUpdate.contractTermsHash,
      contractStateHash: contractUpdate.contractStateHash,
      contractUpdateNonce: contractUpdate.contractUpdateNonce
    }
  }
  return typedData
}

const signContractUpdate = (typedData, account) => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      method: 'eth_signTypedData',
      params: [account, typedData],
      from: account,
      id: new Date().getSeconds()
    }, (error, result) => {
      if (error) { return reject(error) }
      resolve(result)
    })
  })
}

contract('AFPVerify', (accounts) => {
  const recordCreatorAddress = accounts[0]
  const counterpartyAddress = accounts[1]
  
  before(async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
    
    // deploy AFPVerify
    const AFPVerifyInstance = await AFPVerifyArtifact.new()
    AFPVerifyDeployed = new web3.eth.Contract(
      AFPVerify.abi, 
      AFPVerifyInstance.address
    )
  })

  it('should sign the given typed data correctly and yield the correct recovered addresses', async () => {
    const contractId = 'PAM' + Math.floor(new Date().getTime() / 1000)
    const contractUpdate = {
      contractId: web3.utils.toHex(contractId),
      recordCreatorAddress: recordCreatorAddress,
      counterpartyAddress: counterpartyAddress,
      contractAddress: AFPVerifyDeployed.options.address,
      contractTermsHash: web3.utils.keccak256(JSON.stringify('contractTerms')),
      contractStateHash: web3.utils.keccak256(JSON.stringify('extractedContractStateObject')),
      contractUpdateNonce: 0
    }

    const chainId = await web3.eth.net.getId()
    const verifyingContract = AFPVerifyDeployed.options.address
    const typedData = getContractUpdateAsTypedData(contractUpdate, verifyingContract, chainId)

    const { result: recordCreatorSignature } = await signContractUpdate(
      typedData,
      recordCreatorAddress
    )
    const { result: counterpartySignature } = await signContractUpdate(
      typedData,
      counterpartyAddress
    )
  
    const recoveredAddressRecordCreator = sigUtil.recoverTypedSignature({ data: typedData, sig: recordCreatorSignature})
    assert.equal(sigUtil.normalize(recordCreatorAddress), recoveredAddressRecordCreator)
    
    const recoveredAddressCounterparty = sigUtil.recoverTypedSignature({ data: typedData, sig: counterpartySignature})
    assert.equal(sigUtil.normalize(counterpartyAddress), recoveredAddressCounterparty)

    // const response = await AFPVerifyDeployed.methods.verifyContractUpdate(
    //   contractUpdate,
    //   recordCreatorSignature,
    //   counterpartySignature,
    // ).call()
  })
})