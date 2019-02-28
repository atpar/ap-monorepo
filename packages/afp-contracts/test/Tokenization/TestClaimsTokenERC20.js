const ERC223SampleToken = artifacts.require('ERC223SampleToken')
const ClaimsTokenERC20 = artifacts.require('ClaimsTokenERC20')


contract('ClaimsTokenERC20', (accounts) => {

  const ownerA = accounts[0]
  const ownerB = accounts[1]
  const ownerC = accounts[2]
  const ownerD = accounts[3]
  
  const payer = accounts[4]

  const depositAmount = 100 * 10 ** 18

  beforeEach(async () => {
    this.ERC223SampleTokenInstance = await ERC223SampleToken.new()
    this.ClaimsTokenERC20Instance = await ClaimsTokenERC20.new(ownerA, this.ERC223SampleTokenInstance.address)

    this.totalSupply = await this.ClaimsTokenERC20Instance.totalSupply() 

    await this.ClaimsTokenERC20Instance.transfer(ownerB, this.totalSupply.divn(4))
    await this.ClaimsTokenERC20Instance.transfer(ownerC, this.totalSupply.divn(4))
    await this.ClaimsTokenERC20Instance.transfer(ownerD, this.totalSupply.divn(4))    

    // first deposit
    await this.ERC223SampleTokenInstance.transfer(this.ClaimsTokenERC20Instance.address, web3.utils.toHex(depositAmount))
  })

  it('should increment <totalReceivedFunds> after deposit', async () => {
    const claimsTokenERC20Balance = await this.ERC223SampleTokenInstance.balanceOf(this.ClaimsTokenERC20Instance.address)
    const totalReceivedFunds = await this.ClaimsTokenERC20Instance.totalReceivedFunds()

    assert.equal(claimsTokenERC20Balance.toString(), totalReceivedFunds.toString())
  })

  it('should withdraw <newFundsReceived> amount for user', async () => {
    const totalReceivedFunds = await this.ClaimsTokenERC20Instance.totalReceivedFunds()
    const preClaimsTokenERC20Balance = await this.ERC223SampleTokenInstance.balanceOf(this.ClaimsTokenERC20Instance.address)

    await this.ClaimsTokenERC20Instance.withdrawFunds({ from: ownerD })

    const postClaimsTokenERC20Balance = await this.ERC223SampleTokenInstance.balanceOf(this.ClaimsTokenERC20Instance.address)

    assert.equal(preClaimsTokenERC20Balance - (totalReceivedFunds / 4), postClaimsTokenERC20Balance)    
  })

  it('should withdraw <claimedToken> amount for new owner after token transfer', async () => {
    const totalReceivedFunds = await this.ClaimsTokenERC20Instance.totalReceivedFunds()
    const tokenBalanceOfOwnerA = await this.ClaimsTokenERC20Instance.balanceOf(ownerA)

    const preClaimsTokenERC20Balance = await this.ERC223SampleTokenInstance.balanceOf(this.ClaimsTokenERC20Instance.address)

    await this.ClaimsTokenERC20Instance.transfer(ownerD, tokenBalanceOfOwnerA.divn(2))

    // console.log((await this.ClaimsTokenERC20Instance.claimedFunds(ownerD)).toString())
    // console.log((await this.ClaimsTokenERC20Instance.processedFunds(ownerD)).toString())

    await this.ClaimsTokenERC20Instance.withdrawFunds({ from: ownerD })

    const postClaimsTokenERC20Balance = await this.ERC223SampleTokenInstance.balanceOf(this.ClaimsTokenERC20Instance.address)

    assert.equal(preClaimsTokenERC20Balance - (totalReceivedFunds / 4), postClaimsTokenERC20Balance)    
  })

  it('should withdraw <claimedFunds> amount for previous owner after token transfer', async () => {
    const totalReceivedFunds = await this.ClaimsTokenERC20Instance.totalReceivedFunds()
    const tokenBalanceOfOwnerA = await this.ClaimsTokenERC20Instance.balanceOf(ownerA)

    const preClaimsTokenERC20Balance = await this.ERC223SampleTokenInstance.balanceOf(this.ClaimsTokenERC20Instance.address)

    await this.ClaimsTokenERC20Instance.transfer(ownerD, tokenBalanceOfOwnerA.divn(2))
    await this.ClaimsTokenERC20Instance.withdrawFunds({ from: ownerA })

    const postClaimsTokenERC20Balance = await this.ERC223SampleTokenInstance.balanceOf(this.ClaimsTokenERC20Instance.address)

    assert.equal(preClaimsTokenERC20Balance - (totalReceivedFunds / 4), postClaimsTokenERC20Balance)    
  })

  it('should withdraw <claimedFunds> + <newFundsReceived> amount for user after token transfer and second deposit', async () => {
    const tokenBalanceOfOwnerA = await this.ClaimsTokenERC20Instance.balanceOf(ownerA)
    const preClaimsTokenERC20Balance = await this.ERC223SampleTokenInstance.balanceOf(this.ClaimsTokenERC20Instance.address)
    const preTotalReceivedFunds = await this.ClaimsTokenERC20Instance.totalReceivedFunds()

    await this.ClaimsTokenERC20Instance.transfer(ownerD, tokenBalanceOfOwnerA.divn(2))

    // second deposit
    await this.ERC223SampleTokenInstance.transfer(this.ClaimsTokenERC20Instance.address, web3.utils.toHex(depositAmount))

    await this.ClaimsTokenERC20Instance.withdrawFunds({ from: ownerD })

    const postClaimsTokenERC20Balance = await this.ERC223SampleTokenInstance.balanceOf(this.ClaimsTokenERC20Instance.address)

    const claimedFunds = preTotalReceivedFunds / 4
    const newReceivedFundsFraction = depositAmount / 4 + (depositAmount / 4) / 2
  
    assert.equal((Number(preClaimsTokenERC20Balance) + depositAmount) - (claimedFunds + newReceivedFundsFraction), postClaimsTokenERC20Balance)    
  })
})