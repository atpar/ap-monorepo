const BigNumber = require('bignumber.js')

const OwnershipRegistry = artifacts.require('OwnershipRegistry')
const AssetRegistry = artifacts.require('AssetRegistry')
const PaymentRegistry = artifacts.require('PaymentRegistry')
const PaymentRouter = artifacts.require('PaymentRouter')

const PAMContractActor = artifacts.require('PAMContractActor')
const PAMEngine = artifacts.require('PAMEngine')

const parseContractTerms = require('../parser.js').parseContractTerms
const PAMTestTerms = './test/contract-templates/pam-test-terms.csv'

const getContractTerms = (precision) => {
  return parseContractTerms(PAMTestTerms, precision)
}

contract('PAMContractActor', (accounts) => {

  const recordCreatorObligor = accounts[0]
  const recordCreatorBeneficiary = accounts[1]
  const counterpartyObligor = accounts[2]
  const counterpartyBeneficiary = accounts[3]

  const contractId = 'C123'

  before(async () => {
    PAMEngine.numberFormat = 'String'
    PaymentRouter.numberFormat = 'String'

    // compute first state
    this.PAMEngineInstance = await PAMEngine.new()
    const precision = Number(await this.PAMEngineInstance.PRECISION())
    ;({ '10001': this.terms } = await getContractTerms(precision))
    this.state = await this.PAMEngineInstance.computeInitialState(this.terms, {})
    
    // deploy APExtended
    this.OwnershipRegistryInstance = await OwnershipRegistry.new()
    this.AssetRegistryInstance = await AssetRegistry.new()
    this.PaymentRegistryInstance = await PaymentRegistry.new()
    this.PaymentRouterInstance = await PaymentRouter.new(
      this.OwnershipRegistryInstance.address, 
      this.PaymentRegistryInstance.address
    )
    this.PAMContractActorInstance = await PAMContractActor.new(
      this.OwnershipRegistryInstance.address,
      this.AssetRegistryInstance.address,
      this.PaymentRegistryInstance.address,
      this.PaymentRouterInstance.address,
      this.PAMEngineInstance.address
    )

    await this.PaymentRegistryInstance.setPaymentRouter(this.PaymentRouterInstance.address)

    // register Ownership for contractId
    const tx1 = await this.OwnershipRegistryInstance.registerOwnership(
      web3.utils.toHex(contractId), 
      recordCreatorObligor, 
      recordCreatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    )

    // register Contract with contractId
    const tx2 = await this.AssetRegistryInstance.registerContract(
      web3.utils.toHex(contractId),
      this.terms,
      this.state,
      this.PAMContractActorInstance.address
    )

    // console.log(tx1.receipt.cumulativeGasUsed)
    // console.log(tx2.receipt.cumulativeGasUsed)
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
    const eventId = await this.AssetRegistryInstance.getEventId(web3.utils.toHex(contractId))

    const tx3 = await this.PaymentRouterInstance.settlePayment(
      web3.utils.toHex(contractId),
      cashflowId,
      eventId,
      '0x0000000000000000000000000000000000000000',
      value,
      { from: recordCreatorObligor, value: value }
    )

    // const { 2: balance } = await this.PaymentRegistryInstance.getPayoff(web3.utils.toHex(contractId), eventId)

    const tx4 = await this.PAMContractActorInstance.progress(web3.utils.toHex(contractId), currentTimestamp);

    const nextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(contractId))
    const nextEventId = new BigNumber(await this.AssetRegistryInstance.getEventId(web3.utils.toHex(contractId)))
   
    assert.equal(nextState.lastEventTime, currentTimestamp)
    assert.isTrue(nextEventId.isEqualTo(Number(eventId.toString()) + 1))

    // console.log(tx3.receipt.cumulativeGasUsed)
    // console.log(tx4.receipt.cumulativeGasUsed)
  })
})