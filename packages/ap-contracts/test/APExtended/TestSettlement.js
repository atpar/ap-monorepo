const OwnershipRegistry = artifacts.require('OwnershipRegistry')
const PaymentRegistry = artifacts.require('PaymentRegistry')
const PaymentRouter = artifacts.require('PaymentRouter')

const ClaimsTokenETH = artifacts.require('ClaimsTokenETHExtension')


contract('Settlement', (accounts) => {

  const recordCreatorObligor = accounts[0]
  const recordCreatorBeneficiary = accounts[1]
  const counterpartyObligor = accounts[2]
  const counterpartyBeneficiary = accounts[3]

  const ownerA = accounts[4]
  const ownerB = '0x0000000000000000000000000000000000000001'
  const ownerC = '0x0000000000000000000000000000000000000002'
  const ownerD = '0x0000000000000000000000000000000000000003'
  
  const assetId = 'C123'
  const cashflowId = 5
  const payoffAmount = 2 * 10  ** 15

  before(async () => {
    this.OwnershipRegistryInstance = await OwnershipRegistry.new()
    this.PaymentRegistryInstance = await PaymentRegistry.new()
    this.PaymentRouterInstance = await PaymentRouter.new(this.OwnershipRegistryInstance.address, this.PaymentRegistryInstance.address)
    await this.PaymentRegistryInstance.setPaymentRouter(this.PaymentRouterInstance.address)

    // register Ownership for assetId
    await this.OwnershipRegistryInstance.registerOwnership(
      web3.utils.toHex(assetId), 
      {
        recordCreatorObligor, 
        recordCreatorBeneficiary, 
        counterpartyObligor, 
        counterpartyBeneficiary
      }
    )

    // deploy ClaimsTokenETH
    this.ClaimsTokenETHInstance = await ClaimsTokenETH.new(ownerA)
    this.totalSupply = await this.ClaimsTokenETHInstance.totalSupply()

    await this.ClaimsTokenETHInstance.transfer(ownerB, this.totalSupply.divn(4), { from: ownerA })
    await this.ClaimsTokenETHInstance.transfer(ownerC, this.totalSupply.divn(4), { from: ownerA })
    await this.ClaimsTokenETHInstance.transfer(ownerD, this.totalSupply.divn(4), { from: ownerA })

    // set ClaimsTokenETH as beneficiary for CashflowId
    await this.OwnershipRegistryInstance.setBeneficiaryForCashflowId(
      web3.utils.toHex(assetId), 
      cashflowId, 
      this.ClaimsTokenETHInstance.address,
      { from: recordCreatorBeneficiary }
    )
  })

  it('should increment <totalReceivedFunds> after settling payoff in ether', async () => {
    const preBalanceOfClaimsTokenETH = await web3.eth.getBalance(this.ClaimsTokenETHInstance.address)

    await this.PaymentRouterInstance.settlePayment(
      web3.utils.toHex(assetId), 
      cashflowId,
      0,
      '0x0000000000000000000000000000000000000000',
      payoffAmount,
      { from: counterpartyObligor, value: payoffAmount }
    )

    const postBalanceOfClaimsTokenETH = await web3.eth.getBalance(this.ClaimsTokenETHInstance.address)
    const totalReceivedFunds = (await this.ClaimsTokenETHInstance.totalReceivedFunds()).toString()

    assert.equal(postBalanceOfClaimsTokenETH, totalReceivedFunds)
    assert.equal(Number(preBalanceOfClaimsTokenETH) + payoffAmount, postBalanceOfClaimsTokenETH)
  })
})