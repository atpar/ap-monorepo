const BigNumber = require('bignumber.js')
const { expectEvent } = require('openzeppelin-test-helpers');

const OwnershipRegistry = artifacts.require('OwnershipRegistry')
const EconomicsRegistry = artifacts.require('EconomicsRegistry')
const PaymentRegistry = artifacts.require('PaymentRegistry')
const PaymentRouter = artifacts.require('PaymentRouter')

const PAMAssetActor = artifacts.require('PAMAssetActor')
const PAMEngine = artifacts.require('PAMEngine')

const { parseTermsFromPath } = require('../parser.js')
const PAMTestTermsPath = './test/contract-templates/pam-test-terms.csv'

const getTerms = () => {
  return parseTermsFromPath(PAMTestTermsPath)
}

contract('PAMAssetActor', (accounts) => {

  const recordCreatorObligor = accounts[0]
  const recordCreatorBeneficiary = accounts[1]
  const counterpartyObligor = accounts[2]
  const counterpartyBeneficiary = accounts[3]

  const assetId = 'C123'

  before(async () => {
    PAMEngine.numberFormat = 'String'
    PaymentRouter.numberFormat = 'String'

    // compute first state
    this.PAMEngineInstance = await PAMEngine.new()
    ;({ '10001': this.terms } = await getTerms())
    this.state = await this.PAMEngineInstance.computeInitialState(this.terms, {})
    
    // deploy APExtended
    this.OwnershipRegistryInstance = await OwnershipRegistry.new()
    this.EconomicsRegistryInstance = await EconomicsRegistry.new()
    this.PaymentRegistryInstance = await PaymentRegistry.new()
    this.PaymentRouterInstance = await PaymentRouter.new(
      this.OwnershipRegistryInstance.address, 
      this.PaymentRegistryInstance.address
    )
    this.PAMAssetActorInstance = await PAMAssetActor.new(
      this.OwnershipRegistryInstance.address,
      this.EconomicsRegistryInstance.address,
      this.PaymentRegistryInstance.address,
      this.PaymentRouterInstance.address,
      this.PAMEngineInstance.address
    )

    await this.PaymentRegistryInstance.setPaymentRouter(this.PaymentRouterInstance.address)

    // register Ownership for assetId
    await this.OwnershipRegistryInstance.registerOwnership(
      web3.utils.toHex(assetId), 
      recordCreatorObligor, 
      recordCreatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    )

    // register Contract with assetId
    await this.EconomicsRegistryInstance.registerEconomics(
      web3.utils.toHex(assetId),
      this.terms,
      this.state,
      this.PAMAssetActorInstance.address
    )
  })

  it('should process next state', async () => {
    const currentTimestamp = 1356998400

    const { 1: { 0: iedEvent } } = await this.PAMEngineInstance.computeNextState(
      this.terms, 
      this.state, 
      currentTimestamp
    )
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
    const { tx: txHash } = await this.PAMAssetActorInstance.progress(web3.utils.toHex(assetId), currentTimestamp)

    const { args: { 0: emittedAssetId, 1: emittedEventId } } = await expectEvent.inTransaction(
      txHash, PAMAssetActor, 'AssetProgressed'
    )
    const nextState = await this.EconomicsRegistryInstance.getState(web3.utils.toHex(assetId))
    const nextLastEventId = new BigNumber(await this.EconomicsRegistryInstance.getEventId(web3.utils.toHex(assetId)))

    assert.equal(web3.utils.hexToUtf8(emittedAssetId), assetId)
    assert.equal(emittedEventId.toString(), nextLastEventId.toString())
    assert.equal(nextState.lastEventTime, currentTimestamp)
    assert.isTrue(nextLastEventId.isEqualTo(lastEventId + 2)) // todo: do it programmatically
  })
})