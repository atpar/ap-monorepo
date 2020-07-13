const { BN, ether, balance, expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const { createSnapshot, revertToSnapshot, mineBlock, getLatestBlockTimestamp } = require('../helper/blockchain');

const SettlementToken = artifacts.require('SettlementToken');
const DvPSettlement = artifacts.require('DvPSettlement');

function timeNow() {
  return Math.round((new Date()).getTime() / 1000);
}

contract('DvPSettlement', function (accounts) {
  const [creator, counterparty, someone, anyone] = accounts;
  const gasPrice = new BN('1');
  const creatorAmount = new BN(20000);
  const counterpartyAmount = new BN(1000);

  let snapshot
  before(async () => {
    snapshot = await createSnapshot()
  });

  beforeEach(async function () {
    // deploy test ERC20 token
    this.creatorToken = await SettlementToken.new({ from: creator });
    this.counterpartyToken = await SettlementToken.new({ from: counterparty });
    this.dvpSettlementContract = await DvPSettlement.new({ from: someone })
  });

  afterEach(async () => {
    await revertToSnapshot(snapshot);
  });

  describe('end to end test', function () {
    it('should pass end to end test', async function () {
      await this.creatorToken.approve(this.dvpSettlementContract.address, creatorAmount, { from: creator });

      const tomorrow = timeNow() + (60 * 60 * 24)
      const receipt = await this.dvpSettlementContract.createSettlement(
        counterparty,
        this.creatorToken.address,
        this.counterpartyToken.address,
        creatorAmount,
        counterpartyAmount,
        tomorrow,
        { from: creator }
      );

      (await this.creatorToken.balanceOf(this.dvpSettlementContract.address)).should.be.bignumber.equal(creatorAmount);

      const id = receipt.logs[0].args[0];
      const settlement = await this.dvpSettlementContract.settlements(id)

      assert.equal(settlement.counterparty, counterparty);
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
          counterparty,
          this.creatorToken.address,
          this.counterpartyToken.address,
          creatorAmount,
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
        counterparty,
        this.creatorToken.address,
        this.counterpartyToken.address,
        creatorAmount,
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
        counterparty,
        this.creatorToken.address,
        this.counterpartyToken.address,
        creatorAmount,
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
      assert.equal(settlement.status, '4');

    });



  });

});