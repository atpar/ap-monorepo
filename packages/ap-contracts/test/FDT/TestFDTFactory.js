/* global describe, it */
// const { BN, constants, ether, balance, expectEvent, shouldFail } = require('openzeppelin-test-helpers');

// const FDTFactory = artifacts.require('FDTFactory');

// const { ZERO_ADDRESS } = require('../helper/utils');
// const { deployPaymentToken } = require('../helper/setupTestEnvironment');


contract('FDTFactory', function (accounts) {
  // const [owner, tokenHolder1, tokenHolder2, tokenHolder3, anyone] = accounts;
  // const gasPrice = new BN('1');

  describe('FDTFactory', function () {
    /*
    // FIXME: write u-tests for FDTFactory
    truffle(ap-chain)>
    let fdtFactory = await FDTFactory.new()
    let settlementToken = await SettlementToken.deployed()
    let vanillaFDTLogic = await VanillaFDT.deployed()
    let tx1 = await fdtFactory.createERC20Distributor('1st test FDT', 'FDT1', '1000000', settlementToken.address, accounts[4], '555')
    let tx2 = await fdtFactory.createERC20Distributor('2nd test FDT', 'FDT2', '5000000', settlementToken.address, accounts[4], '888')
    let {buildCreate2Eip1167ProxyAddress, buildEip1167ProxyBytecode, buildCreate2Address} = require('./test/helper/proxy/create2.js')(web3)
    buildCreate2Eip1167ProxyAddress(fdtFactory.address, 555, vanillaFDTLogic.address) === tx1.logs[0].args.addr
    buildCreate2Eip1167ProxyAddress(fdtFactory.address, 888, vanillaFDTLogic.address) === tx2.logs[0].args.addr
    let token555 = new web3.eth.Contract(VanillaFDT.abi, tx1.logs[0].args.addr);
    (await token555.methods.symbol().call()) === 'FDT1'
    let token888 = new web3.eth.Contract(VanillaFDT.abi, tx2.logs[0].args.addr);
    (await token888.methods.symbol().call()) === 'FDT2'
    (await token555.getPastEvents({fromBlock:0, toBlock:1000})).length >= 3
    (await token888.getPastEvents({fromBlock:0, toBlock:1000})).length >= 3
    (await vanillaFDTLogic.symbol()) === ''
    (await vanillaFDTLogic.getPastEvents({fromBlock:0, toBlock:1000})).length === 0
    let evs = await fdtFactory.getPastEvents({fromBlock:0, toBlock:1000})
    */
    it('has no tests yet', async function () {
      await Promise.resolve();
    });
  });
});
