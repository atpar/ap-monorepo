const BigNumber = require('bignumber.js')

const OwnershipRegistry = artifacts.require('OwnershipRegistry')
const ContractRegistry = artifacts.require('ContractRegistry')
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
    ;({ '0': this.state } = await this.PAMEngineInstance.initializeContract(this.terms, {}))
    
    // deploy AFPExtended
    this.OwnershipRegistryInstance = await OwnershipRegistry.new()
    this.ContractRegistryInstance = await ContractRegistry.new()
    this.PaymentRegistryInstance = await PaymentRegistry.new()
    this.PaymentRouterInstance = await PaymentRouter.new(
      this.OwnershipRegistryInstance.address, 
      this.PaymentRegistryInstance.address
    )
    this.PAMContractActorInstance = await PAMContractActor.new(
      this.OwnershipRegistryInstance.address,
      this.ContractRegistryInstance.address,
      this.PaymentRegistryInstance.address,
      this.PaymentRouterInstance.address,
      this.PAMEngineInstance.address
    )

    await this.PaymentRegistryInstance.setPaymentRouter(this.PaymentRouterInstance.address)

    // register Ownership for contractId
    await this.OwnershipRegistryInstance.registerOwnership(
      web3.utils.toHex(contractId), 
      recordCreatorObligor, 
      recordCreatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    )

    // register Contract with contractId
    await this.ContractRegistryInstance.registerContract(
      web3.utils.toHex(contractId),
      this.terms,
      this.state,
      this.PAMContractActorInstance.address
    )
  })

  it('should process next state', async () => {
    const currentTimestamp = 1356998400

    const { 1: { 0: iedEvent } } = await this.PAMEngineInstance.getNextState(this.terms, this.state, currentTimestamp)
    const payoff = new BigNumber(iedEvent.payOff)

    const cashflowId = (payoff.isGreaterThan(0)) ? Number(iedEvent.eventType) + 1 : (Number(iedEvent.eventType) + 1) * -1
    const value = web3.utils.toHex((payoff.isGreaterThan(0)) ? payoff : payoff.negated())
    const eventId = await this.ContractRegistryInstance.getEventId(web3.utils.toHex(contractId))

    await this.PaymentRouterInstance.settlePayment(
      web3.utils.toHex(contractId),
      cashflowId,
      eventId,
      '0x0000000000000000000000000000000000000000',
      value,
      { from: recordCreatorObligor, value: value }
    )

    // const { 2: balance } = await this.PaymentRegistryInstance.getPayoff(web3.utils.toHex(contractId), eventId)

    await this.PAMContractActorInstance.progress(web3.utils.toHex(contractId), currentTimestamp);

    const nextState = await this.ContractRegistryInstance.getState(web3.utils.toHex(contractId))
    const nextEventId = new BigNumber(await this.ContractRegistryInstance.getEventId(web3.utils.toHex(contractId)))
   
    assert.equal(nextState.lastEventTime, currentTimestamp)
    assert.isTrue(nextEventId.isEqualTo(Number(eventId.toString()) + 1))
  })
})