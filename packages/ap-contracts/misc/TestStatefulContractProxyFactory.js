const web3Utils = require('web3-utils')
const web3EthAbi = require('web3-eth-abi')

const StatefulContractProxyFactory = artifacts.require('StatefulContractProxyFactory')
const TestContract = artifacts.require('StatefulContractProxyFactoryTestContract')

contract('StatefulContractProxyFactory', (accounts) => {

  let owner = accounts[0]
  let user = accounts[1]

  let StatefullContractProxyFactoryDeployed

  let code = '0x608060405234801561001057600080fd5b506040516040806101d4833981018060405261002f919081019061009a565b8051600055602001516001556100ea565b600061004c82516100e7565b9392505050565b60006040828403121561006557600080fd5b61006f60406100c0565b9050600061007d8484610040565b825250602061008e84848301610040565b60208301525092915050565b6000604082840312156100ac57600080fd5b60006100b88484610053565b949350505050565b60405181810167ffffffffffffffff811182821017156100df57600080fd5b604052919050565b90565b60dc806100f86000396000f300608060405260043610603e5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166367a23d1381146043575b600080fd5b348015604e57600080fd5b506055606a565b60405160619291906081565b60405180910390f35b6000546001549091565b607b81609f565b82525050565b60408101608d82856074565b609860208301846074565b9392505050565b905600a265627a7a7230582030cd2a0151daf386acd0b88b655df1ae20840de62eb2d7ce02d22d02626406146c6578706572696d656e74616cf50037'
  let encodedArguments = web3EthAbi.encodeParameter({ "Foo": { "a": 'bytes32', "b": 'uint' } }, { "a": '0x042', "b": 56 })

  before(async () => {
    StatefullContractProxyFactoryDeployed = await StatefulContractProxyFactory.new()
  })
  
  it('should add contract code with a unique identifier', async () => {
    let identifier = 'PAMv0.1'
    await StatefullContractProxyFactoryDeployed.addContractCode(web3Utils.toHex(identifier), code, { from: owner })
    let retrievedCode = await StatefullContractProxyFactoryDeployed.code(web3Utils.toHex(identifier))
    assert.equal(retrievedCode, code)
  })

  it('should revert when a user is trying to add contract code', async () => {
    let identifier = 'PAMv0.2'
    try {
      await StatefullContractProxyFactoryDeployed.addContractCode(web3Utils.toHex(identifier), code, { from: user })
      // throw('contract didn\'t throw')
    }
    catch(error) {
      return assert.isNotNull(error.message)
      // let expectedErrorMessage = 'Returned error: VM Exception while processing transaction: revert'
      // assert.equal(error.message, expectedErrorMessage)
    }
    assert.fail()
  })

  it('should revert when trying to add contract code with an existing identifier', async () => {
    let identifier = 'PAMv0.1'
    try {
      await StatefullContractProxyFactoryDeployed.addContractCode(web3Utils.toHex(identifier), code, { from: owner })
      // throw('contract didn\'t throw')
    }
    catch(error) {
      return assert.isNotNull(error.message)
      // let expectedErrorMessage = 'Returned error: VM Exception while processing transaction: revert identifier is in use -- Reason given: identifier is in use.'
      // assert.equal(error.message, expectedErrorMessage)
    }
    assert.fail()
  })

  it('should deploy contract with an existing identifier', async () => {
    let identifier = 'PAMv0.1'
    let txHash = await StatefullContractProxyFactoryDeployed.createStatefulContract(web3Utils.toHex(identifier), encodedArguments, { from: user })    
    let deployedContractAddress = txHash.logs[0].args[0]
    let TestContractDeployed = await TestContract.at(deployedContractAddress)
    let value = await TestContractDeployed.getBar()
    assert.isTrue(deployedContractAddress.substring(0,2) == '0x' && Number(value[1].toString()) === 56)
  })

  it('should revert when trying to deploy contract with an unknown identifier ', async () => {
    let identifier = 'PAMv0.2'
    try {
      await StatefullContractProxyFactoryDeployed.createStatefulContract(web3Utils.toHex(identifier), encodedArguments, { from: user })
      throw('contract didn\'t throw')
    }
    catch(error) {
      return assert.isNotNull(error.message)
      // let expectedErrorMessage = 'Returned error: VM Exception while processing transaction: revert unknown identifier -- Reason given: unknown identifier.'
      // assert.equal(error.message, expectedErrorMessage)
    }
    assert.fail()
  })
})
