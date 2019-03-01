const BigNumber = require('bignumber.js')

const ClaimsToken = artifacts.require('ClaimsTokenMultiExtension')


contract('ClaimsToken', (accounts) => {

  const ownerA = accounts[0]
  const ownerB = accounts[1]
  const ownerC = accounts[2]
  const ownerD = accounts[3]
  
  const payer = accounts[4]

  const depositAmount = 100 * 10 ** 18

  beforeEach(async () => {
    this.ClaimsTokenInstance = await ClaimsToken.new(ownerA, '0x0000000000000000000000000000000000000000')
    this.totalSupply = await this.ClaimsTokenInstance.totalSupply()

    await this.ClaimsTokenInstance.transfer(ownerB, this.totalSupply.divn(4))
    await this.ClaimsTokenInstance.transfer(ownerC, this.totalSupply.divn(4))
    await this.ClaimsTokenInstance.transfer(ownerD, this.totalSupply.divn(4))

    await web3.eth.sendTransaction({
      from: payer,
      to: this.ClaimsTokenInstance.address,
      value: depositAmount
    })
  })

  it('ETH: should increment <totalReceivedFunds> after deposit', async () => {
    const claimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)
    const totalReceivedFunds = await this.ClaimsTokenInstance.totalReceivedFunds()

    assert.equal(claimsTokenBalance, totalReceivedFunds)
  })

  it('ETH: should withdraw <newFundsReceived> amount for user', async () => {
    const totalReceivedFunds = await this.ClaimsTokenInstance.totalReceivedFunds()
    const preClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)

    await this.ClaimsTokenInstance.withdrawFunds({ from: ownerD })

    const postClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)

    assert.equal(preClaimsTokenBalance - (totalReceivedFunds / 4), postClaimsTokenBalance)    
  })

  it('ETH: should withdraw <claimedToken> amount for new owner after token transfer', async () => {
    const totalReceivedFunds = await this.ClaimsTokenInstance.totalReceivedFunds()
    const tokenBalanceOfOwnerA = await this.ClaimsTokenInstance.balanceOf(ownerA)

    const preClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)

    await this.ClaimsTokenInstance.transfer(ownerD, tokenBalanceOfOwnerA.divn(2))

    // console.log((await this.ClaimsTokenInstance.claimedFunds(ownerD)).toString())
    // console.log((await this.ClaimsTokenInstance.processedFunds(ownerD)).toString())

    await this.ClaimsTokenInstance.withdrawFunds({ from: ownerD })

    const postClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)

    assert.equal(preClaimsTokenBalance - (totalReceivedFunds / 4), postClaimsTokenBalance)    
  })

  it('ETH: should withdraw <claimedFunds> amount for previous owner after token transfer', async () => {
    const totalReceivedFunds = await this.ClaimsTokenInstance.totalReceivedFunds()
    const tokenBalanceOfOwnerA = await this.ClaimsTokenInstance.balanceOf(ownerA)

    const preClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)

    await this.ClaimsTokenInstance.transfer(ownerD, tokenBalanceOfOwnerA.divn(2))
    await this.ClaimsTokenInstance.withdrawFunds({ from: ownerA })

    const postClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)

    assert.equal(preClaimsTokenBalance - (totalReceivedFunds / 4), postClaimsTokenBalance)    
  })

  it('ETH: should withdraw <claimedFunds> + <newFundsReceived> amount for user after token transfer and second deposit', async () => {
    const tokenBalanceOfOwnerA = await this.ClaimsTokenInstance.balanceOf(ownerA)
    const preClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)
    const preTotalReceivedFunds = await this.ClaimsTokenInstance.totalReceivedFunds()

    await this.ClaimsTokenInstance.transfer(ownerD, tokenBalanceOfOwnerA.divn(2))
    
    await web3.eth.sendTransaction({
      from: payer,
      to: this.ClaimsTokenInstance.address,
      value: depositAmount
    })

    await this.ClaimsTokenInstance.withdrawFunds({ from: ownerD })

    const postClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)

    const claimedFunds = preTotalReceivedFunds / 4
    const newReceivedFundsFraction = depositAmount / 4 + (depositAmount / 4) / 2
  
    assert.equal((Number(preClaimsTokenBalance) + depositAmount) - (claimedFunds + newReceivedFundsFraction), postClaimsTokenBalance)    
  })

  it('ETH: should withdraw <claimedFunds> + <newFundsReceived> for user after token transfers from multiple parties and second deposit', async () => {
    const preClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)

    const tokenBalanceOfOwnerA = await this.ClaimsTokenInstance.balanceOf(ownerA)
    const tokenBalanceOfOwnerB = await this.ClaimsTokenInstance.balanceOf(ownerB)
    const tokenBalanceOfOwnerC = await this.ClaimsTokenInstance.balanceOf(ownerC)
    const tokenBalanceOfOwnerD = await this.ClaimsTokenInstance.balanceOf(ownerD)

    await this.ClaimsTokenInstance.transfer(ownerA, tokenBalanceOfOwnerB.divn(2), { from: ownerB }) // 12.5
    await this.ClaimsTokenInstance.transfer(ownerA, tokenBalanceOfOwnerC.divn(3), { from: ownerC }) // 8.33333333333333
    
    const expectedPreTokenBalanceOfOwnerA = tokenBalanceOfOwnerA.add(tokenBalanceOfOwnerB.divn(2).add(tokenBalanceOfOwnerC.divn(3)))

    await web3.eth.sendTransaction({
      from: payer,
      to: this.ClaimsTokenInstance.address,
      value: depositAmount
    })

    await this.ClaimsTokenInstance.transfer(ownerA, tokenBalanceOfOwnerD.divn(4), { from: ownerD }) // 6.25

    await this.ClaimsTokenInstance.withdrawFunds({ from: ownerA })

    const expectedFractionOfTotalSupplyOfOwnerA = new BigNumber(expectedPreTokenBalanceOfOwnerA).div(this.totalSupply)
    const expectedAmountWithdrawnByOwnerA = new BigNumber(depositAmount).dividedBy(4).plus(expectedFractionOfTotalSupplyOfOwnerA.multipliedBy(depositAmount))
    const expectedPostClaimsTokenBalance = new BigNumber(depositAmount).plus(preClaimsTokenBalance).minus(expectedAmountWithdrawnByOwnerA)

    const postClaimsTokenBalance = await web3.eth.getBalance(this.ClaimsTokenInstance.address)
    
    assert.equal(expectedPostClaimsTokenBalance.toString(), postClaimsTokenBalance)
  })
})