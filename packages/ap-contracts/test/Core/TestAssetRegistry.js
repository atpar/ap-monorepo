const { shouldFail } = require('openzeppelin-test-helpers');

const { setupTestEnvironment, getDefaultTerms } = require('../helper/setupTestEnvironment')

const ENTRY_ALREADY_EXISTS = 'ENTRY_ALREADY_EXISTS'
const UNAUTHORIZED_SENDER = 'UNAUTHORIZED_SENDER'
const INVALID_CASHFLOWID = 'INVALID_CASHFLOWID'


contract('AssetRegistry', (accounts) => {

  const actor = accounts[1]

  const recordCreatorObligor = accounts[2]
  const recordCreatorBeneficiary = accounts[3]
  const counterpartyObligor = accounts[4]
  const counterpartyBeneficiary = accounts[5]
  
  const cashflowIdBeneficiary = accounts[6]
  const newCashflowBeneficiary = accounts[7]

  before(async () => {
    const instances = await setupTestEnvironment()
    Object.keys(instances).forEach((instance) => this[instance] = instances[instance])

    this.assetId = 'C123'
    this.terms = await getDefaultTerms()
    this.state = await this.PAMEngineInstance.computeInitialState(this.terms, {})
    this.ownership = { 
      recordCreatorObligor, 
      recordCreatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    }
  })

  it('should register an asset', async () => {
    await this.AssetRegistryInstance.registerAsset(
      web3.utils.toHex(this.assetId),
      this.ownership,
      this.terms,
      this.state,
      actor
    )

    const state = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId))
    const storedOwnership = await this.AssetRegistryInstance.getOwnership(web3.utils.toHex(this.assetId))
    
    assert.deepEqual(state, this.state)
    assert.equal(storedOwnership.recordCreatorObligor, recordCreatorObligor)
    assert.equal(storedOwnership.recordCreatorBeneficiary, recordCreatorBeneficiary)
    assert.equal(storedOwnership.counterpartyObligor, counterpartyObligor)
    assert.equal(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary)
  })

  it('should not overwrite an existing asset', async () => {
    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.registerAsset(
        web3.utils.toHex(this.assetId),
        this.ownership,
        this.terms,
        this.state,
        actor
      ),
      'AssetRegistry.registerAsset: ' + ENTRY_ALREADY_EXISTS
    )
  })

  it('should let the actor overwrite and update the terms, state and the eventId of an asset', async () => {
    await this.AssetRegistryInstance.setTerms(
      web3.utils.toHex(this.assetId), 
      this.terms,
      { from: actor }
    )

    await this.AssetRegistryInstance.setState(
      web3.utils.toHex(this.assetId), 
      this.state,
      { from: actor }
    )

    await this.AssetRegistryInstance.setEventId(
      web3.utils.toHex(this.assetId), 
      1,
      { from: actor }
    )
  })

  it('should not let an unauthorized account overwrite and update the terms, state and the eventId of an asset', async () => {
    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setTerms(
        web3.utils.toHex(this.assetId), 
        this.terms,
      ),
      'AssetRegistry.onlyDesignatedActor: ' + UNAUTHORIZED_SENDER
    )

    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setState(
        web3.utils.toHex(this.assetId), 
        this.state,
      ),
      'AssetRegistry.onlyDesignatedActor: ' + UNAUTHORIZED_SENDER
    )

    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setEventId(
        web3.utils.toHex(this.assetId), 
        1,
      ),
      'AssetRegistry.onlyDesignatedActor: ' + UNAUTHORIZED_SENDER
    )
  })

  it('should register beneficiary (of payments corresponding to a CashflowId)', async () => {
    const cashflowIdA = 5
    
    await this.AssetRegistryInstance.setBeneficiaryForCashflowId(
      web3.utils.toHex(this.assetId), 
      cashflowIdA, 
      cashflowIdBeneficiary,
      { from: recordCreatorBeneficiary }
    )
    
    const resultA = await this.AssetRegistryInstance.getCashflowBeneficiary(
      web3.utils.toHex(this.assetId), 
      cashflowIdA
    )
    assert.equal(resultA, cashflowIdBeneficiary)

    const cashflowIdB = -5
    
    await this.AssetRegistryInstance.setBeneficiaryForCashflowId(
      web3.utils.toHex(this.assetId), 
      cashflowIdB, 
      cashflowIdBeneficiary,
      { from: counterpartyBeneficiary }
    )
    
    const resultB = await this.AssetRegistryInstance.getCashflowBeneficiary(web3
      .utils.toHex(this.assetId), 
      cashflowIdB
    )
    assert.equal(resultB, cashflowIdBeneficiary)


    await this.AssetRegistryInstance.setBeneficiaryForCashflowId(
      web3.utils.toHex(this.assetId), 
      cashflowIdA, 
      newCashflowBeneficiary,
      { from: cashflowIdBeneficiary }
    )
    
    const resultC = await this.AssetRegistryInstance.getCashflowBeneficiary(
      web3.utils.toHex(this.assetId), 
      cashflowIdA
    )
    assert.equal(resultC, newCashflowBeneficiary)
  })

  it('should not register beneficiary (of payments corresponding to a CashflowId) for an authorized sender', async () => {
    const cashflowIdA = 5
    
    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdA, 
        cashflowIdBeneficiary,
        { from: recordCreatorObligor }
      ),
      'AssetRegistry.setBeneficiaryForCashflowId: ' + UNAUTHORIZED_SENDER
    )

    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdA, 
        cashflowIdBeneficiary,
        { from: counterpartyObligor }
      ),
      'AssetRegistry.setBeneficiaryForCashflowId: ' + UNAUTHORIZED_SENDER
    )

    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdA, 
        cashflowIdBeneficiary,
        { from: counterpartyBeneficiary }
      ),
      'AssetRegistry.setBeneficiaryForCashflowId: ' + UNAUTHORIZED_SENDER
    )

    const cashflowIdB = -5

    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdB, 
        cashflowIdBeneficiary,
        { from: counterpartyObligor }
      ),
      'AssetRegistry.setBeneficiaryForCashflowId: ' + UNAUTHORIZED_SENDER
    )
    
    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdB, 
        cashflowIdBeneficiary,
        { from: recordCreatorObligor }
      ),
      'AssetRegistry.setBeneficiaryForCashflowId: ' + UNAUTHORIZED_SENDER
    )

    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdB, 
        cashflowIdBeneficiary,
        { from: recordCreatorBeneficiary }
      ),
      'AssetRegistry.setBeneficiaryForCashflowId: ' + UNAUTHORIZED_SENDER
    )
  })

  it('should not register beneficiary with an invalid CashflowId', async () => {
    const cashflowId = 0
    
    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowId, 
        cashflowIdBeneficiary,
        { from: recordCreatorBeneficiary }
      ),
      'AssetRegistry.setBeneficiaryForCashflowId: ' + INVALID_CASHFLOWID
    )
  })
})
