const sigUtil = require('eth-sig-util')

const VerifyArtifact = artifacts.require('Verify.sol')


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
        { name: 'recordCreator', type: 'address' },
        { name: 'counterparty', type: 'address' },
        { name: 'contractAddress', type: 'address' },
        { name: 'contractTermsHash', type: 'bytes32' },
        { name: 'contractStateHash', type: 'bytes32' },
        { name: 'contractUpdateNonce', type: 'uint256' }
      ]
    },
    primaryType: 'ContractUpdate',
    message: {
      assetId: contractUpdate.assetId,
      recordCreatorAddress: contractUpdate.recordCreator,
      counterpartyAddress: contractUpdate.counterparty,
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

contract('Verify', (accounts) => {
  const recordCreator = accounts[0]
  const counterparty = accounts[1]
  
  before(async () => {
    this.VerifyInstance = await VerifyArtifact.new()
  })

  it('should sign the given typed data correctly and yield the correct recovered addresses', async () => {
    const assetId = 'PAM' + Math.floor(new Date().getTime() / 1000)
    const contractUpdate = {
      assetId: web3.utils.toHex(assetId),
      recordCreator: recordCreator,
      counterparty: counterparty,
      contractAddress: this.VerifyInstance.address,
      contractTermsHash: web3.utils.keccak256(JSON.stringify('contractTerms')),
      contractStateHash: web3.utils.keccak256(JSON.stringify('extractedContractStateObject')),
      contractUpdateNonce: 0
    }

    const chainId = await web3.eth.net.getId()
    const verifyingContract = this.VerifyInstance.address
    const typedData = getContractUpdateAsTypedData(contractUpdate, verifyingContract, chainId)

    const { result: recordCreatorSignature } = await signContractUpdate(
      typedData,
      recordCreator
    )
    const { result: counterpartySignature } = await signContractUpdate(
      typedData,
      counterparty
    )
  
    const recoveredAddressRecordCreator = sigUtil.recoverTypedSignature({ data: typedData, sig: recordCreatorSignature})
    assert.equal(sigUtil.normalize(recordCreator), recoveredAddressRecordCreator)
    
    const recoveredAddressCounterparty = sigUtil.recoverTypedSignature({ data: typedData, sig: counterpartySignature})
    assert.equal(sigUtil.normalize(counterparty), recoveredAddressCounterparty)

    // const response = await this.VerifyInstance.methods.verifyContractUpdate(
    //   contractUpdate,
    //   recordCreatorSignature,
    //   counterpartySignature,
    // ).call()
  })
})