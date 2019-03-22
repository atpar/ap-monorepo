const { shouldFail } = require('openzeppelin-test-helpers');

const AssetRegistry = artifacts.require('AssetRegistry')
const PAMEngine = artifacts.require('PAMEngine.sol')

const parseContractTerms = require('../parser.js').parseContractTerms
const PAMTestTerms = './test/contract-templates/pam-test-terms.csv'

const ENTRY_ALREADY_EXISTS = 'ENTRY_ALREADY_EXISTS'
const UNAUTHORIZED_SENDER = 'UNAUTHORIZED_SENDER'

const getContractTerms = (precision) => {
  return parseContractTerms(PAMTestTerms, precision)
}

contract('AssetRegistry', (accounts) => {

  const actor = accounts[1]

  before(async () => {
    PAMEngine.numberFormat = 'String'
    const PAMEngineInstance = await PAMEngine.new()
    const precision = Number(await PAMEngineInstance.PRECISION())
    ;({ '10001': this.terms } = await getContractTerms(precision))
    this.state = await PAMEngineInstance.computeInitialState(this.terms, {})

    this.AssetRegistryInstance = await AssetRegistry.new()
    this.contractId = 'C123'
  })

  it('should register a contract', async () => {
    await this.AssetRegistryInstance.registerContract(
      web3.utils.toHex(this.contractId), 
      this.terms,
      this.state,
      actor
    )

    // const terms = await this.AssetRegistryInstance.getTerms(web3.utils.toHex(this.contractId))
    const state = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.contractId))

    assert.deepEqual(state, this.state)
  })

  it('should not overwrite an existing contract', async () => {
    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.registerContract(
        web3.utils.toHex(this.contractId), 
        this.terms,
        this.state,
        actor
      ),
      ENTRY_ALREADY_EXISTS
    )
  })

  it('should let the actor overwrite and update the terms, state and the eventId of a contract', async () => {
    await this.AssetRegistryInstance.setTerms(
      web3.utils.toHex(this.contractId), 
      this.terms,
      { from: actor }
    )

    await this.AssetRegistryInstance.setState(
      web3.utils.toHex(this.contractId), 
      this.state,
      { from: actor }
    )

    await this.AssetRegistryInstance.setEventId(
      web3.utils.toHex(this.contractId), 
      1,
      { from: actor }
    )
  })

  it('should not let an unauthorized account overwrite and update the terms, state and the eventId of a contract', async () => {
    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setTerms(
        web3.utils.toHex(this.contractId), 
        this.terms,
      ),
      UNAUTHORIZED_SENDER
    )

    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setState(
        web3.utils.toHex(this.contractId), 
        this.state,
      ),
      UNAUTHORIZED_SENDER
    )

    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setEventId(
        web3.utils.toHex(this.contractId), 
        1,
      ),
      UNAUTHORIZED_SENDER
    )
  })
})
