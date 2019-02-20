const OwnershipRegistry = artifacts.require('OwnershipRegistry')


contract('TestAssetIssuance', (accounts) => {

  const contractId = 'C123'

  const recordCreatorObligor = accounts[0]
  const recordCreatorBeneficiary = accounts[1]
  const counterpartyObligor = accounts[2]
  const counterpartyBeneficiary = accounts[3]

  let OwnershipRegistryInstance

  before(async () => {
    OwnershipRegistryInstance = await OwnershipRegistry.new()
  })


  it('should register ownership of an asset', async () => {
    await OwnershipRegistryInstance.registerOwnership(
      web3.utils.toHex(contractId), 
      recordCreatorObligor, 
      recordCreatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    )

    const result = await OwnershipRegistryInstance.getContractOwnership(web3.utils.toHex(contractId))
    
    assert.equal(result[0], recordCreatorObligor)
    assert.equal(result[1], recordCreatorBeneficiary)
    assert.equal(result[2], counterpartyObligor)
    assert.equal(result[3], counterpartyBeneficiary)
  })

  
})