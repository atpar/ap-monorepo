const OwnershipRegistry = artifacts.require('OwnershipRegistry')
const PaymentRegistry = artifacts.require('PaymentRegistry')
const PaymentRouter = artifacts.require('PaymentRouter')

const ClaimsTokenERC20 = artifacts.require('ClaimsTokenERC20Extension')
const ERC20SampleToken = artifacts.require('ERC20SampleToken')

contract('SettlementETH', (accounts) => {

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

    // deploy test ERC20 token
    this.PaymentTokenInstance = await ERC20SampleToken.new()
    await this.PaymentTokenInstance.transfer(counterpartyObligor, payoffAmount)

    // deploy ClaimsTokenERC20
    this.ClaimsTokenERC20Instance = await ClaimsTokenERC20.new(ownerA, this.PaymentTokenInstance.address)
    this.totalSupply = await this.ClaimsTokenERC20Instance.totalSupply()

    await this.ClaimsTokenERC20Instance.transfer(ownerB, this.totalSupply.divn(4), { from: ownerA })
    await this.ClaimsTokenERC20Instance.transfer(ownerC, this.totalSupply.divn(4), { from: ownerA })
    await this.ClaimsTokenERC20Instance.transfer(ownerD, this.totalSupply.divn(4), { from: ownerA })

    // set ClaimsTokenERC20 as beneficiary for CashflowId
    await this.OwnershipRegistryInstance.setBeneficiaryForCashflowId(
      web3.utils.toHex(assetId), 
      cashflowId, 
      this.ClaimsTokenERC20Instance.address,
      { from: recordCreatorBeneficiary }
    )
  })

  it('should increment <totalReceivedFunds> after settling payoff in tokens', async () => {
    const preBalanceOfClaimsTokenERC20 = (await this.PaymentTokenInstance.balanceOf(
      this.ClaimsTokenERC20Instance.address)).toString()

    await this.PaymentTokenInstance.approve(
      this.PaymentRouterInstance.address, 
      payoffAmount, 
      { from: counterpartyObligor }
    )

    await this.PaymentRouterInstance.settlePayment(
      web3.utils.toHex(assetId), 
      cashflowId,
      0,
      this.PaymentTokenInstance.address,
      payoffAmount,
      { from: counterpartyObligor }
    )

    await this.ClaimsTokenERC20Instance.updateFundsReceived()

    const postBalanceOfClaimsTokenERC20 = (await this.PaymentTokenInstance.balanceOf(
      this.ClaimsTokenERC20Instance.address
    )).toString()
    const totalReceivedFunds = (await this.ClaimsTokenERC20Instance.totalReceivedFunds()).toString()

    assert.equal(postBalanceOfClaimsTokenERC20, totalReceivedFunds)
    assert.equal(Number(preBalanceOfClaimsTokenERC20) + payoffAmount, postBalanceOfClaimsTokenERC20)
  })
})