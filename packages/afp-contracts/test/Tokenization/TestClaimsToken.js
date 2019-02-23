const ClaimsToken = artifacts.require('ClaimsToken')


contract('ClaimsToken', (accounts) => {

  const ownerA = accounts[0]
  const ownerB = accounts[1]
  const ownerC = accounts[2]
  const ownerD = accounts[3]
  
  const payer = accounts[4]

  const depositAmount = 100 * 10 ** 18

  beforeEach(async () => {
    this.ClaimsTokenInstance = await ClaimsToken.new(ownerA)

    this.totalSupply = await this.ClaimsTokenInstance.SUPPLY()

    await this.ClaimsTokenInstance.transfer(ownerB, this.totalSupply.divn(4))
    await this.ClaimsTokenInstance.transfer(ownerC, this.totalSupply.divn(4))
    await this.ClaimsTokenInstance.transfer(ownerD, this.totalSupply.divn(4))

    await this.ClaimsTokenInstance.depositFunds({ from: payer, value: depositAmount })
  })

  it('should increment cummulativeFundsReceived after deposit', async () => {
    const claimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)
    const cummulativeFundsReceived = await this.ClaimsTokenInstance.cummulativeFundsReceived()

    assert.equal(claimsTokenBalance, cummulativeFundsReceived)
  })

  it('should withdraw <newFundsReceived> amount for user', async () => {
    const cummulativeFundsReceived = await this.ClaimsTokenInstance.cummulativeFundsReceived()
    const preClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)

    await this.ClaimsTokenInstance.withdraw({ from: ownerD })

    const postClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)

    assert.equal(preClaimsTokenBalance - (cummulativeFundsReceived / 4), postClaimsTokenBalance)    
  })

  it('should withdraw <notWithdrawnPayout> amount for new owner after token transfer', async () => {
    const cummulativeFundsReceived = await this.ClaimsTokenInstance.cummulativeFundsReceived()
    const tokenBalanceOfOwnerA = await this.ClaimsTokenInstance.balanceOf(ownerA)

    const preClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)

    await this.ClaimsTokenInstance.transfer(ownerD, tokenBalanceOfOwnerA.divn(2))

    // console.log((await this.ClaimsTokenInstance.notWithdrawnPayout(ownerD)).toString())
    // console.log((await this.ClaimsTokenInstance.processedCummulativeFundsReceivedFor(ownerD)).toString())

    await this.ClaimsTokenInstance.withdraw({ from: ownerD })

    const postClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)

    assert.equal(preClaimsTokenBalance - (cummulativeFundsReceived / 4), postClaimsTokenBalance)    
  })

  it('should withdraw <notWithdrawnPayout> amount for previous owner after token transfer', async () => {
    const cummulativeFundsReceived = await this.ClaimsTokenInstance.cummulativeFundsReceived()
    const tokenBalanceOfOwnerA = await this.ClaimsTokenInstance.balanceOf(ownerA)

    const preClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)

    await this.ClaimsTokenInstance.transfer(ownerD, tokenBalanceOfOwnerA.divn(2))
    await this.ClaimsTokenInstance.withdraw({ from: ownerA })

    const postClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)

    assert.equal(preClaimsTokenBalance - (cummulativeFundsReceived / 4), postClaimsTokenBalance)    
  })

  it('should withdraw <notWithdrawnPayout> + <newFundsReceived> amount for user after token transfer and second deposit', async () => {
    const cummulativeFundsReceived = await this.ClaimsTokenInstance.cummulativeFundsReceived()
    const tokenBalanceOfOwnerA = await this.ClaimsTokenInstance.balanceOf(ownerA)

    const preClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)

    await this.ClaimsTokenInstance.transfer(ownerD, tokenBalanceOfOwnerA.divn(2))
    await this.ClaimsTokenInstance.depositFunds({ from:  payer, value: this.depositAmount })
    await this.ClaimsTokenInstance.withdraw({ from: ownerD })

    const postClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)

    assert.equal(preClaimsTokenBalance - (cummulativeFundsReceived / 2) + (cummulativeFundsReceived / 4), postClaimsTokenBalance)    
  })
})