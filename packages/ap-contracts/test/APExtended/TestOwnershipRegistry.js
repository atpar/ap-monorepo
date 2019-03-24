const { shouldFail } = require('openzeppelin-test-helpers');

const OwnershipRegistry = artifacts.require('OwnershipRegistry')

const ENTRY_ALREADY_EXISTS = 'ENTRY_ALREADY_EXISTS'
const UNAUTHORIZED_SENDER = 'UNAUTHORIZED_SENDER'
const INVALID_CASHFLOWID = 'INVALID_CASHFLOWID'


contract('OwnershipRegistry', (accounts) => {

  const recordCreatorObligor = accounts[0]
  const recordCreatorBeneficiary = accounts[1]
  const counterpartyObligor = accounts[2]
  const counterpartyBeneficiary = accounts[3]
  
  const cashflowIdBeneficiary = accounts[4]
  const newCashflowBeneficiary = accounts[5]

  before(async () => {
    this.OwnershipRegistryInstance = await OwnershipRegistry.new()
    this.assetId = 'C123'
  })

  it('should register ownership of an asset', async () => {
    await this.OwnershipRegistryInstance.registerOwnership(
      web3.utils.toHex(this.assetId), 
      recordCreatorObligor, 
      recordCreatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    )

    const result = await this.OwnershipRegistryInstance.getOwnership(web3.utils.toHex(this.assetId))
    
    assert.equal(result[0], recordCreatorObligor)
    assert.equal(result[1], recordCreatorBeneficiary)
    assert.equal(result[2], counterpartyObligor)
    assert.equal(result[3], counterpartyBeneficiary)
  })

  it('should not register ownership of an already registered asset', async () => {
    await shouldFail.reverting.withMessage(
      this.OwnershipRegistryInstance.registerOwnership(
        web3.utils.toHex(this.assetId), 
        recordCreatorObligor, 
        recordCreatorBeneficiary, 
        counterpartyObligor, 
        counterpartyBeneficiary
      ),
      ENTRY_ALREADY_EXISTS
    )
  })

  it('should register beneficiary (of payments corresponding to a CashflowId)', async () => {
    const cashflowIdA = 5
    
    await this.OwnershipRegistryInstance.setBeneficiaryForCashflowId(
      web3.utils.toHex(this.assetId), 
      cashflowIdA, 
      cashflowIdBeneficiary,
      { from: recordCreatorBeneficiary }
    )
    
    const resultA = await this.OwnershipRegistryInstance.getCashflowBeneficiary(
      web3.utils.toHex(this.assetId), 
      cashflowIdA
    )
    assert.equal(resultA, cashflowIdBeneficiary)


    const cashflowIdB = -5
    
    await this.OwnershipRegistryInstance.setBeneficiaryForCashflowId(
      web3.utils.toHex(this.assetId), 
      cashflowIdB, 
      cashflowIdBeneficiary,
      { from: counterpartyBeneficiary }
    )
    
    const resultB = await this.OwnershipRegistryInstance.getCashflowBeneficiary(web3
      .utils.toHex(this.assetId), 
      cashflowIdB
    )
    assert.equal(resultB, cashflowIdBeneficiary)


    await this.OwnershipRegistryInstance.setBeneficiaryForCashflowId(
      web3.utils.toHex(this.assetId), 
      cashflowIdA, 
      newCashflowBeneficiary,
      { from: cashflowIdBeneficiary }
    )
    
    const resultC = await this.OwnershipRegistryInstance.getCashflowBeneficiary(
      web3.utils.toHex(this.assetId), 
      cashflowIdA
    )
    assert.equal(resultC, newCashflowBeneficiary)
  })

  it('should not register beneficiary (of payments corresponding to a CashflowId) for an authorized sender', async () => {
    const cashflowIdA = 5
    
    await shouldFail.reverting.withMessage(
      this.OwnershipRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdA, 
        cashflowIdBeneficiary,
        { from: recordCreatorObligor }
      ),
      UNAUTHORIZED_SENDER
    )

    await shouldFail.reverting.withMessage(
      this.OwnershipRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdA, 
        cashflowIdBeneficiary,
        { from: counterpartyObligor }
      ),
      UNAUTHORIZED_SENDER
    )

    await shouldFail.reverting.withMessage(
      this.OwnershipRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdA, 
        cashflowIdBeneficiary,
        { from: counterpartyBeneficiary }
      ),
      UNAUTHORIZED_SENDER
    )

    const cashflowIdB = -5

    await shouldFail.reverting.withMessage(
      this.OwnershipRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdB, 
        cashflowIdBeneficiary,
        { from: counterpartyObligor }
      ),
      UNAUTHORIZED_SENDER
    )
    
    await shouldFail.reverting.withMessage(
      this.OwnershipRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdB, 
        cashflowIdBeneficiary,
        { from: recordCreatorObligor }
      ),
      UNAUTHORIZED_SENDER
    )

    await shouldFail.reverting.withMessage(
      this.OwnershipRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdB, 
        cashflowIdBeneficiary,
        { from: recordCreatorBeneficiary }
      ),
      UNAUTHORIZED_SENDER
    )
  })

  it('should not register beneficiary with an invalid CashflowId', async () => {
    const cashflowId = 0
    
    await shouldFail.reverting.withMessage(
      this.OwnershipRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowId, 
        cashflowIdBeneficiary,
        { from: recordCreatorBeneficiary }
      ),
      INVALID_CASHFLOWID
    )
  })
})
