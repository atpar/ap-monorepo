const { shouldFail } = require('openzeppelin-test-helpers');

const ContractRegistry = artifacts.require('ContractRegistry')
const PAMEngine = artifacts.require('PAMEngine.sol')

const parseContractTerms = require('../parser.js').parseContractTerms
const PAMTestTerms = './test/contract-templates/pam-test-terms.csv'

const ENTRY_ALREADY_EXISTS = 'ENTRY_ALREADY_EXISTS'
const UNAUTHORIZED_SENDER = 'UNAUTHORIZED_SENDER'

const getContractTerms = (precision) => {
  return parseContractTerms(PAMTestTerms, precision)
}

contract('ContractRegistry', (accounts) => {

  const actor = accounts[1]

  before(async () => {
    PAMEngine.numberFormat = 'String'
    const PAMEngineInstance = await PAMEngine.new()
    const precision = Number(await PAMEngineInstance.PRECISION())
    ;({ '10001': this.terms } = await getContractTerms(precision))
    ;({ '0': this.state } = await PAMEngineInstance.initializeContract(this.terms, {}))

    this.ContractRegistryInstance = await ContractRegistry.new()
    this.contractId = 'C123'
  })

  it('should register a contract', async () => {
    await this.ContractRegistryInstance.registerContract(
      web3.utils.toHex(this.contractId), 
      this.terms,
      this.state,
      actor
    )

    // const terms = await this.ContractRegistryInstance.getTerms(web3.utils.toHex(this.contractId))
    const state = await this.ContractRegistryInstance.getState(web3.utils.toHex(this.contractId))

    assert.deepEqual(state, this.state)
  })

  it('should not overwrite an existing contract', async () => {
    await shouldFail.reverting.withMessage(
      this.ContractRegistryInstance.registerContract(
        web3.utils.toHex(this.contractId), 
        this.terms,
        this.state,
        actor
      ),
      ENTRY_ALREADY_EXISTS
    )
  })

  it('should let the actor overwrite and update the terms, state and the eventId of a contract', async () => {
    await this.ContractRegistryInstance.setTerms(
      web3.utils.toHex(this.contractId), 
      this.terms,
      { from: actor }
    )

    await this.ContractRegistryInstance.setState(
      web3.utils.toHex(this.contractId), 
      this.state,
      { from: actor }
    )

    await this.ContractRegistryInstance.setEventId(
      web3.utils.toHex(this.contractId), 
      1,
      { from: actor }
    )
  })

  it('should not let an unauthorized account overwrite and update the terms, state and the eventId of a contract', async () => {
    await shouldFail.reverting.withMessage(
      this.ContractRegistryInstance.setTerms(
        web3.utils.toHex(this.contractId), 
        this.terms,
      ),
      UNAUTHORIZED_SENDER
    )

    await shouldFail.reverting.withMessage(
      this.ContractRegistryInstance.setState(
        web3.utils.toHex(this.contractId), 
        this.state,
      ),
      UNAUTHORIZED_SENDER
    )

    await shouldFail.reverting.withMessage(
      this.ContractRegistryInstance.setEventId(
        web3.utils.toHex(this.contractId), 
        1,
      ),
      UNAUTHORIZED_SENDER
    )
  })
})
