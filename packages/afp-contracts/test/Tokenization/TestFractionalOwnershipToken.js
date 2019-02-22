const FractionalOwnershipToken = artifacts.require('FractionalOwnershipToken')


contract('TestFractionalOwnershipToken', (accounts) => {

  const ownerA = accounts[0]
  const ownerB = accounts[1]
  const ownerC = accounts[2]
  const ownerD = accounts[3]
  
  const payer = accounts[4]

  const depositAmount = 100 * 10 ** 18

  beforeEach(async () => {
    this.FractionalOwnershipTokenInstance = await FractionalOwnershipToken.new(ownerA)

    this.totalSupply = await this.FractionalOwnershipTokenInstance.SUPPLY()

    this.FractionalOwnershipTokenInstance.transfer(ownerB, this.totalSupply.divn(4))
    this.FractionalOwnershipTokenInstance.transfer(ownerC, this.totalSupply.divn(4))
    this.FractionalOwnershipTokenInstance.transfer(ownerD, this.totalSupply.divn(4))

    await this.FractionalOwnershipTokenInstance.depositFunds({ from: payer, value: depositAmount })
  })

  it('should increment cummulativeFundsReceived after deposit', async () => {
    const fractionalOwnershipBalance = await web3.eth.getBalance(this.FractionalOwnershipTokenInstance.address)
    const cummulativeFundsReceived = await this.FractionalOwnershipTokenInstance.cummulativeFundsReceived()

    assert.equal(fractionalOwnershipBalance, cummulativeFundsReceived)
  })

  it('should withdraw <newFundsReceived> amount for user', async () => {
    const cummulativeFundsReceived = await this.FractionalOwnershipTokenInstance.cummulativeFundsReceived()
    const preFractionalOwnershipBalance = await web3.eth.getBalance(this.FractionalOwnershipTokenInstance.address)

    await this.FractionalOwnershipTokenInstance.withdraw({ from: ownerD })

    const postFractionalOwnershipBalance = await web3.eth.getBalance(this.FractionalOwnershipTokenInstance.address)

    assert.equal(preFractionalOwnershipBalance - (cummulativeFundsReceived / 4), postFractionalOwnershipBalance)    
  })

  it('should withdraw <notWithdrawnPayout> amount for new owner after token transfer', async () => {
    const cummulativeFundsReceived = await this.FractionalOwnershipTokenInstance.cummulativeFundsReceived()
    const tokenBalanceOfOwnerA = await this.FractionalOwnershipTokenInstance.balanceOf(ownerA)

    const preFractionalOwnershipBalance = await web3.eth.getBalance(this.FractionalOwnershipTokenInstance.address)

    await this.FractionalOwnershipTokenInstance.transfer(ownerD, tokenBalanceOfOwnerA.divn(2))

    // console.log((await this.FractionalOwnershipTokenInstance.notWithdrawnPayout(ownerD)).toString())
    // console.log((await this.FractionalOwnershipTokenInstance.processedCummulativeFundsReceivedFor(ownerD)).toString())

    await this.FractionalOwnershipTokenInstance.withdraw({ from: ownerD })

    const postFractionalOwnershipBalance = await web3.eth.getBalance(this.FractionalOwnershipTokenInstance.address)

    assert.equal(preFractionalOwnershipBalance - (cummulativeFundsReceived / 4), postFractionalOwnershipBalance)    
  })

  it('should withdraw <notWithdrawnPayout> amount for previous owner after token transfer', async () => {
    const cummulativeFundsReceived = await this.FractionalOwnershipTokenInstance.cummulativeFundsReceived()
    const tokenBalanceOfOwnerA = await this.FractionalOwnershipTokenInstance.balanceOf(ownerA)

    const preFractionalOwnershipBalance = await web3.eth.getBalance(this.FractionalOwnershipTokenInstance.address)

    await this.FractionalOwnershipTokenInstance.transfer(ownerD, tokenBalanceOfOwnerA.divn(2))
    await this.FractionalOwnershipTokenInstance.withdraw({ from: ownerA })

    const postFractionalOwnershipBalance = await web3.eth.getBalance(this.FractionalOwnershipTokenInstance.address)

    assert.equal(preFractionalOwnershipBalance - (cummulativeFundsReceived / 4), postFractionalOwnershipBalance)    
  })

  it('should withdraw <notWithdrawnPayout> + <newFundsReceived> amount for user after token transfer and second deposit', async () => {
    const cummulativeFundsReceived = await this.FractionalOwnershipTokenInstance.cummulativeFundsReceived()
    const tokenBalanceOfOwnerA = await this.FractionalOwnershipTokenInstance.balanceOf(ownerA)

    const preFractionalOwnershipBalance = await web3.eth.getBalance(this.FractionalOwnershipTokenInstance.address)

    await this.FractionalOwnershipTokenInstance.transfer(ownerD, tokenBalanceOfOwnerA.divn(2))
    await this.FractionalOwnershipTokenInstance.depositFunds({ from:  payer, value: this.depositAmount })
    await this.FractionalOwnershipTokenInstance.withdraw({ from: ownerD })

    const postFractionalOwnershipBalance = await web3.eth.getBalance(this.FractionalOwnershipTokenInstance.address)

    assert.equal(preFractionalOwnershipBalance - (cummulativeFundsReceived / 2) + (cummulativeFundsReceived / 4), postFractionalOwnershipBalance)    
  })
})