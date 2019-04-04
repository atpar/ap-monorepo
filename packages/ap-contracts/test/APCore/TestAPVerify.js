const Web3 = require('web3')
const sigUtil = require('eth-sig-util')

const APVerifyArtifact = artifacts.require('APVerify.sol')
const APVerify = require('../../build/contracts/APVerify.json')

const getContractUpdateAsTypedData = (contractUpdate, verifyingContract, chainId) => {
  const typedData = {
    domain: {
      name: 'ACTUS Protocol',
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
        { name: 'assetId', type: 'bytes32' },
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
      assetId: contractUpdate.assetId,
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

contract('APVerify', (accounts) => {
  const recordCreatorAddress = accounts[0]
  const counterpartyAddress = accounts[1]
  
  before(async () => {
    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
    
    // deploy APVerify
    const APVerifyInstance = await APVerifyArtifact.new()
    APVerifyDeployed = new web3.eth.Contract(
      APVerify.abi, 
      APVerifyInstance.address
    )
  })

  it('should sign the given typed data correctly and yield the correct recovered addresses', async () => {
    const assetId = 'PAM' + Math.floor(new Date().getTime() / 1000)
    const contractUpdate = {
      assetId: web3.utils.toHex(assetId),
      recordCreatorAddress: recordCreatorAddress,
      counterpartyAddress: counterpartyAddress,
      contractAddress: APVerifyDeployed.options.address,
      contractTermsHash: web3.utils.keccak256(JSON.stringify('contractTerms')),
      contractStateHash: web3.utils.keccak256(JSON.stringify('extractedContractStateObject')),
      contractUpdateNonce: 0
    }

    const chainId = await web3.eth.net.getId()
    const verifyingContract = APVerifyDeployed.options.address
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

    // const response = await APVerifyDeployed.methods.verifyContractUpdate(
    //   contractUpdate,
    //   recordCreatorSignature,
    //   counterpartySignature,
    // ).call()
  })
})