const OwnershipRegistry = artifacts.require('OwnershipRegistry')
const PaymentRegistry = artifacts.require('PaymentRegistry')
const PaymentRouter = artifacts.require('PaymentRouter')

const ClaimsToken = artifacts.require('ClaimsToken')


contract('Settlement', (accounts) => {

  const recordCreatorObligor = accounts[0]
  const recordCreatorBeneficiary = accounts[1]
  const counterpartyObligor = accounts[2]
  const counterpartyBeneficiary = accounts[3]

  const ownerA = accounts[4]
  const ownerB = '0x0000000000000000000000000000000000000001'
  const ownerC = '0x0000000000000000000000000000000000000002'
  const ownerD = '0x0000000000000000000000000000000000000003'
  
  const contractId = 'C123'
  const cashflowId = 5
  const payoffAmount = 2 * 10  ** 15

  before(async () => {
    this.OwnershipRegistryInstance = await OwnershipRegistry.new()
    this.PaymentRegistryInstance = await PaymentRegistry.new()
    this.PaymentRouterInstance = await PaymentRouter.new(this.OwnershipRegistryInstance.address, this.PaymentRegistryInstance.address)
    await this.PaymentRegistryInstance.setPaymentRouter(this.PaymentRouterInstance.address)

    // register Ownership for contractId
    await this.OwnershipRegistryInstance.registerOwnership(
      web3.utils.toHex(contractId), 
      recordCreatorObligor, 
      recordCreatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    )

    // deploy ClaimsToken
    this.ClaimsTokenInstance = await ClaimsToken.new(ownerA)
    this.totalSupply = await this.ClaimsTokenInstance.SUPPLY()

    await this.ClaimsTokenInstance.transfer(ownerB, this.totalSupply.divn(4), { from: ownerA })
    await this.ClaimsTokenInstance.transfer(ownerC, this.totalSupply.divn(4), { from: ownerA })
    await this.ClaimsTokenInstance.transfer(ownerD, this.totalSupply.divn(4), { from: ownerA })

    // set ClaimsToken as beneficiary for CashflowId
    await this.OwnershipRegistryInstance.setBeneficiaryForCashflowId(
      web3.utils.toHex(contractId), 
      cashflowId, 
      this.ClaimsTokenInstance.address,
      { from: recordCreatorBeneficiary }
    )
  })

  it('should increment cummulativeFundsReceived after settling payoff in ether', async () => {
    const preBalanceOfClaimsToken = await web3.eth.getBalance(this.ClaimsTokenInstance.address)

    await this.PaymentRouterInstance.settlePayment(
      web3.utils.toHex(contractId), 
      cashflowId,
      0,
      '0x0000000000000000000000000000000000000000',
      payoffAmount,
      { from: counterpartyObligor, value: payoffAmount }
    )

    const postBalanceOfClaimsToken = await web3.eth.getBalance(this.ClaimsTokenInstance.address)
    const cummulativeFundsReceived = (await this.ClaimsTokenInstance.cummulativeFundsReceived()).toString()

    assert.equal(postBalanceOfClaimsToken, cummulativeFundsReceived)
    assert.equal(Number(preBalanceOfClaimsToken) + payoffAmount, postBalanceOfClaimsToken)
  })
})