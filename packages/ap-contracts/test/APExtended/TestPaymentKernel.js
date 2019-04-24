const { shouldFail, expectEvent } = require('openzeppelin-test-helpers');

const PaymentRegistry = artifacts.require('PaymentRegistry')
const PaymentRouter = artifacts.require('PaymentRouter')
const OwnershipRegistry = artifacts.require('OwnershipRegistry')

const ENTRY_ALREADY_EXISTS = 'ENTRY_ALREADY_EXISTS'
const UNAUTHORIZED_SENDER_OR_UNKNOWN_CONTRACTOWNERSHIP = 'UNAUTHORIZED_SENDER_OR_UNKNOWN_CONTRACTOWNERSHIP'
const INVALID_CONTRACTID_OR_CASHFLOWID = 'INVALID_CONTRACTID_OR_CASHFLOWID'


contract('PaymentKernel', (accounts) => {

  const recordCreatorObligor = accounts[0]
  const recordCreatorBeneficiary = accounts[1]
  const counterpartyObligor = accounts[2]
  const counterpartyBeneficiary = accounts[3]
  
  const cashflowIdBeneficiary = accounts[4]

  before(async () => {
    this.OwnershipRegistryInstance = await OwnershipRegistry.new()
    this.PaymentRegistryInstance = await PaymentRegistry.new()
    this.PaymentRouterInstance = await PaymentRouter.new(this.OwnershipRegistryInstance.address, this.PaymentRegistryInstance.address)

    await this.PaymentRegistryInstance.setPaymentRouter(this.PaymentRouterInstance.address)

    this.assetId = 'C123'
    this.value = 5000

    await this.OwnershipRegistryInstance.registerOwnership(
      web3.utils.toHex(this.assetId), 
      {
        recordCreatorObligor, 
        recordCreatorBeneficiary, 
        counterpartyObligor, 
        counterpartyBeneficiary
      }
    )

    await this.OwnershipRegistryInstance.setBeneficiaryForCashflowId(
      web3.utils.toHex(this.assetId),
      5,
      cashflowIdBeneficiary,
      { from: recordCreatorBeneficiary }
    )
  })

  it('should settle and register a payment', async () => {
    const preBalanceOfBeneficiary = await web3.eth.getBalance(counterpartyBeneficiary)

    const { tx: txHash } = await this.PaymentRouterInstance.settlePayment(
      web3.utils.toHex(this.assetId), 
      -3,
      1,
      '0x0000000000000000000000000000000000000000',
      5000,
      { value: this.value }
    )
    
    const { args: { 0: emittedAssetId, 1: emittedEventId } } = await expectEvent.inTransaction(txHash, PaymentRegistry, 'Paid')

    const payoffBalanceFromEvent = await this.PaymentRegistryInstance.getPayoffBalance(emittedAssetId, emittedEventId)
    const payoffBalance = await this.PaymentRegistryInstance.getPayoffBalance(web3.utils.toHex(this.assetId), 1); // eventId)

    const postBalanceOfBeneficiary = await web3.eth.getBalance(counterpartyBeneficiary)


    assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId)
    assert.isTrue(payoffBalanceFromEvent.toString() === payoffBalance.toString())
    assert.isTrue(payoffBalance > 0)
    assert.equal(Number(preBalanceOfBeneficiary) + this.value, postBalanceOfBeneficiary)
  })

  it('should settle and register a payment routed to a beneficiary corresponding to a CashflowId', async () => {
    const preBalanceOfBeneficiary = await web3.eth.getBalance(cashflowIdBeneficiary)

    const { tx: txHash } = await this.PaymentRouterInstance.settlePayment(
      web3.utils.toHex(this.assetId), 
      5,
      2,
      '0x0000000000000000000000000000000000000000',
      5000,
      { from: counterpartyObligor, value: this.value }
    )
    
    const { args: { 0: emittedAssetId, 1: emittedEventId } } = await expectEvent.inTransaction(txHash, PaymentRegistry, 'Paid')
    
    const payoffBalanceFromEvent = await this.PaymentRegistryInstance.getPayoffBalance(emittedAssetId, emittedEventId)
    const payoffBalance = await this.PaymentRegistryInstance.getPayoffBalance(web3.utils.toHex(this.assetId), 2)

    const postBalanceOfBeneficiary = await web3.eth.getBalance(cashflowIdBeneficiary)

    assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId)
    assert.isTrue(payoffBalanceFromEvent.toString() === payoffBalance.toString())
    assert.isTrue(payoffBalance > 0)
    assert.equal(Number(preBalanceOfBeneficiary) + this.value, postBalanceOfBeneficiary)
  })

  // it('should not overwrite an existing payment entry', async () => {
  //   await shouldFail.reverting.withMessage(
  //     this.PaymentRouterInstance.settlePayment(
  //       web3.utils.toHex(this.assetId), 
  //       -3,
  //       0,
  //       '0x0000000000000000000000000000000000000000',
  //       5000,
  //       { value: this.value }
  //     ),
  //     ENTRY_ALREADY_EXISTS
  //   )
  // })

  it('should revert for an invalid AssetId and an invalid CashflowId', async () => {
    await shouldFail.reverting.withMessage(
      this.PaymentRouterInstance.settlePayment(
        web3.utils.toHex(''), 
        -3,
        0,
        '0x0000000000000000000000000000000000000000',
        5000,
        { value: this.value }
      ),
      INVALID_CONTRACTID_OR_CASHFLOWID
    )

    await shouldFail.reverting.withMessage(
      this.PaymentRouterInstance.settlePayment(
        web3.utils.toHex(this.assetId), 
        0,
        0,
        '0x0000000000000000000000000000000000000000',
        5000,
        { value: this.value }
      ),
      INVALID_CONTRACTID_OR_CASHFLOWID
    )
  })

  it('should revert for an unknown ownership of a contract', async () => {
    await shouldFail.reverting.withMessage(
      this.PaymentRouterInstance.settlePayment(
        web3.utils.toHex('C567'), 
        -3,
        0,
        '0x0000000000000000000000000000000000000000',
        5000,
        { value: this.value }
      ),
      UNAUTHORIZED_SENDER_OR_UNKNOWN_CONTRACTOWNERSHIP
    )
  })

  it('should revert for an unauthorized sender', async () => {
    await shouldFail.reverting.withMessage(
      this.PaymentRouterInstance.settlePayment(
        web3.utils.toHex(this.assetId), 
        3,
        0,
        '0x0000000000000000000000000000000000000000',
        5000,
        { from: counterpartyBeneficiary, value: this.value }
      ),
      UNAUTHORIZED_SENDER_OR_UNKNOWN_CONTRACTOWNERSHIP
    )
  })

  it('should revert for an unauthorized sender (for a payment routed to a beneficiary corresponding to a CashflowId)', async () => {
    await shouldFail.reverting.withMessage(
      this.PaymentRouterInstance.settlePayment(
        web3.utils.toHex(this.assetId), 
        5,
        1,
        '0x0000000000000000000000000000000000000000',
        5000,
        { from: recordCreatorObligor, value: this.value }
      ),
      UNAUTHORIZED_SENDER_OR_UNKNOWN_CONTRACTOWNERSHIP
    )
  })
})
