const { BN, ether, balance, expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const { createSnapshot, revertToSnapshot, mineBlock, getLatestBlockTimestamp } = require('../helper/blockchain');
const { ZERO_ADDRESS } = require('../helper/utils');


const SettlementToken = artifacts.require('SettlementToken');
const DvPSettlement = artifacts.require('DvPSettlement');

function timeNow() {
  return Math.round((new Date()).getTime() / 1000);
}

contract('DvPSettlement', function (accounts) {
  const [creator, counterparty, someone, anyone] = accounts;
  const creatorAmount = new BN(20000);
  const counterpartyAmount = new BN(1000);

  beforeEach(async function () {
    // deploy test ERC20 tokens for creator and counterparty
    this.creatorToken = await SettlementToken.new({ from: creator });
    this.counterpartyToken = await SettlementToken.new({ from: counterparty });

    // deploy DvPSettlement Contract
    this.dvpSettlementContract = await DvPSettlement.new({ from: someone })
  });


  describe('end to end test', function () {
    it('should pass end to end test', async function () {

      // creator must first approve at least `creatorAmount` of tokens before creating a new settlement
      await this.creatorToken.approve(this.dvpSettlementContract.address, creatorAmount, { from: creator });

      // some time in the future
      const tomorrow = timeNow() + (60 * 60 * 24)

      // create new Settlement with a specified `counterparty` address
      const receipt = await this.dvpSettlementContract.createSettlement(
        this.creatorToken.address,
        creatorAmount,
        counterparty,
        this.counterpartyToken.address,
        counterpartyAmount,
        tomorrow,
        { from: creator }
      );

      // check that the contract has received the `creatorAmount` of `creatorToken`
      (await this.creatorToken.balanceOf(this.dvpSettlementContract.address)).should.be.bignumber.equal(creatorAmount);

      // get Settlement ID from the logs
      const id = receipt.logs[0].args[0];

      // Read settlement from blockchain and check that it is initialized correctly
      const settlement = await this.dvpSettlementContract.settlements(id);
      (settlement.expirationDate).should.be.bignumber.equal(new BN(tomorrow));
      assert.equal(settlement.status, '1');


      // counterparty must approve at least `counterpartyAmount` of `counterpartyToken` before calling executeSettlement
      await this.counterpartyToken.approve(this.dvpSettlementContract.address, counterpartyAmount, { from: counterparty });

      // counterparty calls executeSettlement
      const tx = await this.dvpSettlementContract.executeSettlement(id, { from: counterparty })

      // check that SettlementExecuted event exists in transaction logs
      await expectEvent.inTransaction(
        tx.tx, DvPSettlement, 'SettlementExecuted'
      );

      // Read the settlement from the blockchain again and check that status is now EXECUTED
      const settlement2 = await this.dvpSettlementContract.settlements(id)
      assert.equal(settlement2.status, '2');

      // Check the balance of both creator and counterparty after execution to ensure that tokens were swapped
      const creatorBalanceOfcpToken = await this.counterpartyToken.balanceOf(creator);
      const cpBalanceOfCreatorToken = await this.creatorToken.balanceOf(counterparty);
      creatorBalanceOfcpToken.should.be.bignumber.equal(counterpartyAmount);
      cpBalanceOfCreatorToken.should.be.bignumber.equal(creatorAmount);

    });

    it('should pass open Settlement end to end test', async function () {
      await this.creatorToken.approve(this.dvpSettlementContract.address, creatorAmount, { from: creator });

      const tomorrow = timeNow() + (60 * 60 * 24)
      const receipt = await this.dvpSettlementContract.createSettlement(
        this.creatorToken.address,
        creatorAmount,
        ZERO_ADDRESS,
        this.counterpartyToken.address,
        counterpartyAmount,
        tomorrow,
        { from: creator }
      );

      (await this.creatorToken.balanceOf(this.dvpSettlementContract.address)).should.be.bignumber.equal(creatorAmount);

      const id = receipt.logs[0].args[0];
      const settlement = await this.dvpSettlementContract.settlements(id);

      (settlement.expirationDate).should.be.bignumber.equal(new BN(tomorrow));
      assert.equal(settlement.status, '1');


      await this.counterpartyToken.approve(this.dvpSettlementContract.address, counterpartyAmount, { from: counterparty });
      const tx = await this.dvpSettlementContract.executeSettlement(id, { from: counterparty })

      await expectEvent.inTransaction(
        tx.tx, DvPSettlement, 'SettlementExecuted'
      );

      const settlement2 = await this.dvpSettlementContract.settlements(id)
      assert.equal(settlement2.status, '2');

      const creatorBalanceOfcpToken = await this.counterpartyToken.balanceOf(creator);
      const cpBalanceOfCreatorToken = await this.creatorToken.balanceOf(counterparty);

      creatorBalanceOfcpToken.should.be.bignumber.equal(counterpartyAmount);
      cpBalanceOfCreatorToken.should.be.bignumber.equal(creatorAmount);

    });
  });

  describe('expiration date tests', function () {
    it('should revert on a past expiration date in createSettlement', async function () {
      await this.creatorToken.approve(this.dvpSettlementContract.address, creatorAmount, { from: creator });
      const lastTimestamp = (await web3.eth.getBlock('latest')).timestamp;
      await shouldFail.reverting(
        this.dvpSettlementContract.createSettlement(
          this.creatorToken.address,
          creatorAmount,
          counterparty,
          this.counterpartyToken.address,
          counterpartyAmount,
          lastTimestamp - 1,
          { from: creator }
        )
      );
    });

    it('should revert when attempting to execute a settlement past its expiration', async function () {
      await this.creatorToken.approve(this.dvpSettlementContract.address, creatorAmount, { from: creator });
      const tomorrow = timeNow() + (60 * 60 * 24)
      const tx = await this.dvpSettlementContract.createSettlement(
        this.creatorToken.address,
        creatorAmount,
        counterparty,
        this.counterpartyToken.address,
        counterpartyAmount,
        tomorrow,
        { from: creator }
      );
      const id = tx.logs[0].args[0];

      await this.counterpartyToken.approve(this.dvpSettlementContract.address, counterpartyAmount, { from: counterparty });
      await mineBlock(tomorrow + 1)

      await shouldFail.reverting(
        this.dvpSettlementContract.executeSettlement(id, { from: counterparty })
      );

    });


    it('should allow anyone to call expireSettlement to return tokens to creator after expiration date', async function () {
      await this.creatorToken.approve(this.dvpSettlementContract.address, creatorAmount, { from: creator });
      const future = (await web3.eth.getBlock('latest')).timestamp + (60 * 60)
      const tx = await this.dvpSettlementContract.createSettlement(
        this.creatorToken.address,
        creatorAmount,
        counterparty,
        this.counterpartyToken.address,
        counterpartyAmount,
        future,
        { from: creator }
      );
      const id = tx.logs[0].args[0];
      await this.counterpartyToken.approve(this.dvpSettlementContract.address, counterpartyAmount, { from: counterparty });
      await mineBlock(future + 1)
      let tx2 = await this.dvpSettlementContract.expireSettlement(id, { from: anyone })
      await expectEvent.inTransaction(
        tx2.tx, DvPSettlement, 'SettlementExpired'
      );
      const settlement = await this.dvpSettlementContract.settlements(id)
      assert.equal(settlement.status, '3');
    });
  });

});