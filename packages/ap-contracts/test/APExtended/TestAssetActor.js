const BigNumber = require('bignumber.js')
const { expectEvent } = require('openzeppelin-test-helpers');

const OwnershipRegistry = artifacts.require('OwnershipRegistry')
const EconomicsRegistry = artifacts.require('EconomicsRegistry')
const PaymentRegistry = artifacts.require('PaymentRegistry')
const PaymentRouter = artifacts.require('PaymentRouter')

const AssetActor = artifacts.require('AssetActor')
const PAMEngine = artifacts.require('PAMEngine')

const { getDefaultTerms } = require('../helper/tests')


contract('AssetActor', (accounts) => {

  const issuer = accounts[0]
  const recordCreatorObligor = accounts[1]
  const recordCreatorBeneficiary = accounts[2]
  const counterpartyObligor = accounts[3]
  const counterpartyBeneficiary = accounts[4]

  const assetId = 'C123'

  before(async () => {
    PAMEngine.numberFormat = 'String'
    PaymentRouter.numberFormat = 'String'

    // compute first state
    this.PAMEngineInstance = await PAMEngine.new()

    this.terms = await getDefaultTerms()
    this.state = await this.PAMEngineInstance.computeInitialState(this.terms, {})
    this.ownership = {
      recordCreatorObligor, 
      recordCreatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    }
    
    // deploy APExtended
    this.OwnershipRegistryInstance = await OwnershipRegistry.new()
    this.EconomicsRegistryInstance = await EconomicsRegistry.new()
    this.PaymentRegistryInstance = await PaymentRegistry.new()
    this.PaymentRouterInstance = await PaymentRouter.new(
      this.OwnershipRegistryInstance.address, 
      this.PaymentRegistryInstance.address
    )
    this.AssetActorInstance = await AssetActor.new(
      this.OwnershipRegistryInstance.address,
      this.EconomicsRegistryInstance.address,
      this.PaymentRegistryInstance.address,
      this.PaymentRouterInstance.address,
      this.PAMEngineInstance.address
    )

    await this.PaymentRegistryInstance.setPaymentRouter(this.PaymentRouterInstance.address)
    // await this.AssetActorInstance.registerIssuer(issuer)
  })

  it('shoudl initialize an asset', async () => {
    await this.AssetActorInstance.initialize(
      web3.utils.toHex(assetId),
      this.ownership,
      this.terms
    )

    const storedTerms = await this.EconomicsRegistryInstance.getTerms(web3.utils.toHex(assetId))
    const storedState = await this.EconomicsRegistryInstance.getState(web3.utils.toHex(assetId))
    const storedOwnership = await this.OwnershipRegistryInstance.getOwnership(web3.utils.toHex(assetId))

    assert.deepEqual(storedTerms['contractDealDate'], this.terms['contractDealDate'].toString())
    assert.deepEqual(storedState, this.state)

    assert.equal(storedOwnership.recordCreatorObligor, recordCreatorObligor)
    assert.equal(storedOwnership.recordCreatorBeneficiary, recordCreatorBeneficiary)
    assert.equal(storedOwnership.counterpartyObligor, counterpartyObligor)
    assert.equal(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary)
  })

  it('should process next state', async () => {
    const { 1: { 0: iedEvent } } = await this.PAMEngineInstance.computeNextState(
      this.terms, 
      this.state, 
      this.terms['maturityDate']
    )
    const eventTime = iedEvent.scheduledTime
    const payoff = new BigNumber(iedEvent.payoff)
    const cashflowId = (payoff.isGreaterThan(0)) ? Number(iedEvent.eventType) + 1 : (Number(iedEvent.eventType) + 1) * -1
    const value = web3.utils.toHex((payoff.isGreaterThan(0)) ? payoff : payoff.negated())
    const lastEventId = Number(await this.EconomicsRegistryInstance.getEventId(web3.utils.toHex(assetId)))

    // settle obligations
    await this.PaymentRouterInstance.settlePayment(
      web3.utils.toHex(assetId),
      cashflowId,
      lastEventId + 1,
      '0x0000000000000000000000000000000000000000',
      value,
      { from: recordCreatorObligor, value: value }
    )

    // progress asset state
    const { tx: txHash } = await this.AssetActorInstance.progress(web3.utils.toHex(assetId), eventTime)
    const { args: { 0: emittedAssetId, 1: emittedEventId } } = await expectEvent.inTransaction(
      txHash, AssetActor, 'AssetProgressed'
    )
    const nextState = await this.EconomicsRegistryInstance.getState(web3.utils.toHex(assetId))
    const nextLastEventId = new BigNumber(await this.EconomicsRegistryInstance.getEventId(web3.utils.toHex(assetId)))

    assert.equal(web3.utils.hexToUtf8(emittedAssetId), assetId)
    assert.equal(emittedEventId.toString(), nextLastEventId.toString())
    assert.equal(nextState.lastEventTime, eventTime)
    assert.isTrue(nextLastEventId.isEqualTo(lastEventId + 2)) // IED + IP, todo: do it programmatically
  })
})