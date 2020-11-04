/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('@nomiclabs/buidler');
const { shouldFail } = require('openzeppelin-test-helpers');

const { expectEvent, ZERO_ADDRESS } = require('../helper/utils/utils');
const { mineBlock } = require('../helper/utils/blockchain');
const { getSnapshotTaker, deployDvPSettlement, deployPaymentToken } = require('../helper/setupTestEnvironment');


describe('DvPSettlement', () => {
  let creator, counterparty, creatorBeneficiary, someone, anyone;

  const creatorAmount = '20000';
  const counterpartyAmount = '1000';

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [ /*deployer*/, /*actor*/, creator, counterparty, creatorBeneficiary, someone, anyone ] = self.accounts;

    // deploy test ERC20 tokens for creator and counterparty
    self.creatorToken = await deployPaymentToken(buidlerRuntime, creator);
    self.counterpartyToken = await deployPaymentToken(buidlerRuntime, counterparty);

    // deploy DvPSettlement Contract
    self.dvpSettlementContract = await deployDvPSettlement(buidlerRuntime, someone);
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
  });

  beforeEach(async () => {
    await this.setupTestEnvironment();
  });

  describe('end to end test', () => {
    it('should pass end to end test', async () => {

      // creator must first approve at least `creatorAmount` of tokens before creating a new settlement
      await this.creatorToken.methods.approve(this.dvpSettlementContract.options.address, creatorAmount)
        .send({ from: creator });

      // some time in the future
      const tomorrow = `${timeNow() + (60 * 60 * 24)}`

      // create new Settlement with a specified `counterparty` address
      const { events } = await this.dvpSettlementContract.methods.createSettlement(
        this.creatorToken.options.address,
        creatorAmount,
        creatorBeneficiary,
        counterparty,
        this.counterpartyToken.options.address,
        counterpartyAmount,
        tomorrow,
      ).send({ from: creator });

      // check that the contract has received the `creatorAmount` of `creatorToken`
      (await this.creatorToken.methods.balanceOf(this.dvpSettlementContract.options.address).call())
        .should.be.equal(creatorAmount);

      // get Settlement ID from the logs
      const id = events.SettlementInitialized.returnValues.settlementId;

      // Read settlement from blockchain and check that it is initialized correctly
      const settlement = await this.dvpSettlementContract.methods.settlements(id).call();
      (settlement.expirationDate).should.be.equal(tomorrow);
      assert.strictEqual(settlement.status, '1');


      // counterparty must approve at least `counterpartyAmount` of `counterpartyToken` before calling executeSettlement
      await this.counterpartyToken.methods.approve(this.dvpSettlementContract.options.address, counterpartyAmount)
        .send({ from: counterparty });

      // counterparty calls executeSettlement
      const { events: events_exec } = await this.dvpSettlementContract.methods.executeSettlement(id)
        .send({ from: counterparty })

      // check that SettlementExecuted event exists in transaction logs
      await expectEvent(events_exec, 'SettlementExecuted');

      // Read the settlement from the blockchain again and check that status is now EXECUTED
      const settlement2 = await this.dvpSettlementContract.methods.settlements(id).call()
      assert.strictEqual(settlement2.status, '2');

      // Check the balance of both creatorBeneficiary and counterparty after execution to ensure tokens were swapped
      const creatorBalanceOfCpToken = await this.counterpartyToken.methods.balanceOf(creatorBeneficiary).call();
      const cpBalanceOfCreatorToken = await this.creatorToken.methods.balanceOf(counterparty).call();
      creatorBalanceOfCpToken.should.be.equal(counterpartyAmount);
      cpBalanceOfCreatorToken.should.be.equal(creatorAmount);

    });

    it('should pass open Settlement end to end test', async () => {
      await this.creatorToken.methods.approve(this.dvpSettlementContract.options.address, creatorAmount)
        .send({ from: creator });

      const tomorrow = `${timeNow() + (60 * 60 * 24)}`;
      const { events } = await this.dvpSettlementContract.methods.createSettlement(
        this.creatorToken.options.address,
        creatorAmount,
        creatorBeneficiary,
        ZERO_ADDRESS,
        this.counterpartyToken.options.address,
        counterpartyAmount,
        tomorrow,
      ).send({ from: creator });

      (await this.creatorToken.methods.balanceOf(this.dvpSettlementContract.options.address).call())
        .should.be.equal(creatorAmount);

      const id = events.SettlementInitialized.returnValues.settlementId;
      const settlement = await this.dvpSettlementContract.methods.settlements(id).call();

      (settlement.expirationDate).should.be.equal(tomorrow);
      assert.strictEqual(settlement.status, '1');


      await this.counterpartyToken.methods.approve(this.dvpSettlementContract.options.address, counterpartyAmount)
        .send({ from: counterparty });
      const { events: events_exec } = await this.dvpSettlementContract.methods.executeSettlement(id)
        .send({ from: counterparty })

      await expectEvent(events_exec, 'SettlementExecuted');

      const settlement2 = await this.dvpSettlementContract.methods.settlements(id).call()
      assert.strictEqual(settlement2.status, '2');

      const creatorBalanceOfCpToken = await this.counterpartyToken.methods.balanceOf(creatorBeneficiary).call();
      const cpBalanceOfCreatorToken = await this.creatorToken.methods.balanceOf(counterparty).call();

      creatorBalanceOfCpToken.should.be.equal(counterpartyAmount);
      cpBalanceOfCreatorToken.should.be.equal(creatorAmount);

    });

    it('should pass empty beneficiary end to end test', async () => {

      // creator must first approve at least `creatorAmount` of tokens before creating a new settlement
      await this.creatorToken.methods.approve(this.dvpSettlementContract.options.address, creatorAmount)
        .send({ from: creator });

      // some time in the future
      const tomorrow = `${timeNow() + (60 * 60 * 24)}`;

      // create new Settlement with a specified `counterparty` address
      const { events } = await this.dvpSettlementContract.methods.createSettlement(
        this.creatorToken.options.address,
        creatorAmount,
        ZERO_ADDRESS,
        counterparty,
        this.counterpartyToken.options.address,
        counterpartyAmount,
        tomorrow,
      ).send({ from: creator });

      // check that the contract has received the `creatorAmount` of `creatorToken`
      (await this.creatorToken.methods.balanceOf(this.dvpSettlementContract.options.address).call())
        .should.be.equal(creatorAmount);

      // get Settlement ID from the logs
      const id = events.SettlementInitialized.returnValues.settlementId;

      // Read settlement from blockchain and check that it is initialized correctly
      const settlement = await this.dvpSettlementContract.methods.settlements(id).call();
      (settlement.expirationDate).should.be.equal(tomorrow);
      assert.strictEqual(settlement.status, '1');


      // counterparty must approve at least `counterpartyAmount` of `counterpartyToken` before calling executeSettlement
      await this.counterpartyToken.methods.approve(this.dvpSettlementContract.options.address, counterpartyAmount)
        .send({ from: counterparty });

      // counterparty calls executeSettlement
      const { events: events_exec } = await this.dvpSettlementContract.methods.executeSettlement(id)
        .send({ from: counterparty })

      // check that SettlementExecuted event exists in transaction logs
      await expectEvent(events_exec, 'SettlementExecuted');

      // Read the settlement from the blockchain again and check that status is now EXECUTED
      const settlement2 = await this.dvpSettlementContract.methods.settlements(id).call()
      assert.strictEqual(settlement2.status, '2');

      // Check the balance of both creator and counterparty after execution to ensure that tokens were swapped
      const creatorBalanceOfCpToken = await this.counterpartyToken.methods.balanceOf(creator).call();
      const cpBalanceOfCreatorToken = await this.creatorToken.methods.balanceOf(counterparty).call();
      creatorBalanceOfCpToken.should.be.equal(counterpartyAmount);
      cpBalanceOfCreatorToken.should.be.equal(creatorAmount);

    });
  });

  describe('expiration date tests', () => {
    it('should revert on a past expiration date in createSettlement', async () => {
      await this.creatorToken.methods.approve(this.dvpSettlementContract.options.address, creatorAmount)
        .send({ from: creator });
      const lastTimestamp = (await web3.eth.getBlock('latest')).timestamp;
      await shouldFail.reverting(
        this.dvpSettlementContract.methods.createSettlement(
          this.creatorToken.options.address,
          creatorAmount,
          creatorBeneficiary,
          counterparty,
          this.counterpartyToken.options.address,
          counterpartyAmount,
          lastTimestamp - 1,
        ).send({ from: creator })
      );
    });

    it('should revert when attempting to execute a settlement past its expiration', async () => {
      await this.creatorToken.methods.approve(this.dvpSettlementContract.options.address, creatorAmount)
        .send({ from: creator });
      const tomorrow = `${timeNow() + (60 * 60 * 24)}`;
      const { events } = await this.dvpSettlementContract.methods.createSettlement(
        this.creatorToken.options.address,
        creatorAmount,
        creatorBeneficiary,
        counterparty,
        this.counterpartyToken.options.address,
        counterpartyAmount,
        tomorrow,
      ).send({ from: creator });
      const id = events.SettlementInitialized.returnValues.settlementId;

      await this.counterpartyToken.methods.approve(this.dvpSettlementContract.options.address, counterpartyAmount)
        .send({ from: counterparty });
      await mineBlock(parseInt(tomorrow) + 1)

      await shouldFail.reverting(
        this.dvpSettlementContract.methods.executeSettlement(id).send({ from: counterparty })
      );

    });


    it('should allow anyone to call expireSettlement to return tokens to creator after expiration date', async () => {
      await this.creatorToken.methods.approve(this.dvpSettlementContract.options.address, creatorAmount)
        .send({ from: creator });
      const future = (await web3.eth.getBlock('latest')).timestamp + (60 * 60)
      const { events } = await this.dvpSettlementContract.methods.createSettlement(
        this.creatorToken.options.address,
        creatorAmount,
        creatorBeneficiary,
        counterparty,
        this.counterpartyToken.options.address,
        counterpartyAmount,
        future,
      ).send({ from: creator });
      const id = events.SettlementInitialized.returnValues.settlementId;
      await this.counterpartyToken.methods.approve(this.dvpSettlementContract.options.address, counterpartyAmount)
        .send({ from: counterparty });
      await mineBlock(future + 1)
      const { events: events_expire } = await this.dvpSettlementContract.methods.expireSettlement(id)
        .send({ from: anyone })
      await expectEvent(events_expire, 'SettlementExpired');
      const settlement = await this.dvpSettlementContract.methods.settlements(id).call()
      assert.strictEqual(settlement.status, '3');
    });
  });

});

function timeNow() {
  return Math.round((new Date()).getTime() / 1000);
}
