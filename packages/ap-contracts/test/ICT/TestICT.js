/* global before, beforeEach, contract, describe, it, web3 */
const { BN, ether, expectEvent, shouldFail } = require('openzeppelin-test-helpers');

const ICToken = artifacts.require('ICT');

const { ZERO_ADDRESS } = require('../helper/utils');
const { setupTestEnvironment } = require('../helper/setupTestEnvironment');


contract('ICT', function (accounts) {
  const [owner, tokenHolder1, tokenHolder2, anyone] = accounts;
  const b32 = web3.utils.hexToBytes;

  const ictParams = {
    name: "Investment Certificate Token",
    symbol: "ICT",
    marketObjectCode: b32('0xADA')
  };

  before(async () => {
    this.instances =  await setupTestEnvironment(accounts);
    ictParams.assetRegistry = this.instances.ANNRegistryInstance.address;
    ictParams.dataRegistry = this.instances.DataRegistryInstance.address;
  });

  // before each `it`, even in `describe`
  beforeEach(async function () {
    this.icToken = await ICToken.new(
        ictParams.assetRegistry,
        ictParams.dataRegistry,
        ictParams.marketObjectCode,
    );
  });

  describe('constructor', function() {
    describe('When called with zero address of the asset registry', () => {
      it('reverts', async () => await shouldFail.reverting(
          ICToken.new(ZERO_ADDRESS, ictParams.dataRegistry, ictParams.marketObjectCode)
      ));
    });

    describe('When called with zero address of the data registry', () => {
      it('reverts', async () => await shouldFail.reverting(
          ICToken.new(ictParams.assetRegistry, ZERO_ADDRESS, ictParams.marketObjectCode)
      ));
    });

    describe('When called with the asset registry address bing EOA', () => {
      it('reverts', async () => await shouldFail.reverting(
          ICToken.new(tokenHolder1, ictParams.dataRegistry, ictParams.marketObjectCode)
      ));
    });

    describe('When called with the data registry address bing EOA', () => {
      it('reverts', async () => await shouldFail.reverting(
          ICToken.new(ictParams.assetRegistry, tokenHolder1, ictParams.marketObjectCode)
      ));
    });

    describe('When called with the valid asset and data registry addresses', () => {
      it('does NOT revert', async () =>
          await ICToken.new(ictParams.assetRegistry, ictParams.dataRegistry, ictParams.marketObjectCode)
      );
    });
  });

  // TODO: realize token logic - how to mint?
  describe.skip('transfer', function () {
    beforeEach(async function () {
      await this.icToken.mint(tokenHolder1, ether('1'), {from: owner});
    });

    describe('when the recipient is the zero address', function () {
      it('reverts', async function () {
        await shouldFail.reverting(
            this.icToken.transfer(ZERO_ADDRESS, ether('0.5'), {from: tokenHolder1})
        );
      });
    });

    describe('when the recipient is not the zero address', function () {
      describe('when the sender does not have enough balance', function () {
        it('reverts', async function () {
          await shouldFail.reverting(
              this.icToken.transfer(tokenHolder2, ether('2'), {from: tokenHolder1})
          );
        });
      });

      describe('when the sender has enough balance', function () {
        it('transfers the requested amount', async function () {
          await this.icToken.transfer(tokenHolder2, ether('0.25'), {from: tokenHolder1});

          (await this.icToken.balanceOf(tokenHolder1)).should.be.bignumber.equal(ether('0.75'));
          (await this.icToken.balanceOf(tokenHolder2)).should.be.bignumber.equal(ether('0.25'));
        });

        it('emits a transfer event', async function () {
          const { logs } = await this.icToken.transfer(tokenHolder2, ether('0.25'), {from: tokenHolder1});

          expectEvent.inLogs(logs, 'Transfer', {
            from: tokenHolder1,
            to: tokenHolder2,
            value: ether('0.25'),
          });
        });
      });
    });
  });

  // TODO: realize token logic - how to mint?
  describe.skip('transfer from', function () {
    const mintAmount = ether('9');
    const approveAmount = ether('3');
    const transferAmount = ether('1');
    const spender = anyone;

    beforeEach(async function () {
      await this.icToken.mint(tokenHolder1, mintAmount, {from: owner});
    });

    describe('when the recipient is not the zero address', function () {
      describe('when the spender has enough approved balance', function () {
        beforeEach(async function () {
          await this.icToken.approve(spender, approveAmount, { from: tokenHolder1 });
        });

        describe('when the initial holder has enough balance', function () {
          let logs;

          beforeEach(async function () {
            const receipt = await this.icToken.transferFrom(tokenHolder1, tokenHolder2, transferAmount, { from: spender });
            logs = receipt.logs;
          });

          it('transfers the requested amount', async function () {
            (await this.icToken.balanceOf(tokenHolder1)).should.be.bignumber.equal( mintAmount.sub(transferAmount) );
            (await this.icToken.balanceOf(tokenHolder2)).should.be.bignumber.equal( transferAmount );
          });

          it('decreases the spender allowance', async function () {
            (await this.icToken.allowance(tokenHolder1, spender)).should.be.bignumber.equal( approveAmount.sub(transferAmount) );
          });

          it('emits a transfer event', async function () {
            expectEvent.inLogs(logs, 'Transfer', {
              from: tokenHolder1,
              to: tokenHolder2,
              value: transferAmount,
            });
          });

          it('emits an approval event', async function () {
            expectEvent.inLogs(logs, 'Approval', {
              owner: tokenHolder1,
              spender: spender,
              value: approveAmount.sub(transferAmount),
            });
          });
        });

        describe('when the initial holder does not have enough balance', function () {
          const _approveAmount = mintAmount.addn(1);
          const _transferAmount = _approveAmount;

          beforeEach(async function () {
            await this.icToken.approve(spender, _approveAmount, { from: tokenHolder1 });
          });

          it('reverts', async function () {
            await shouldFail.reverting(this.icToken.transferFrom(tokenHolder1, tokenHolder2, _transferAmount, { from: spender }));
          });
        });
      });

      describe('when the spender does not have enough approved balance', function () {
        beforeEach(async function () {
          await this.icToken.approve(spender, approveAmount, { from: tokenHolder1 });
        });

        describe('when the initial holder has enough balance', function () {
          const _transferAmount = approveAmount.addn(1);

          it('reverts', async function () {
            await shouldFail.reverting(this.icToken.transferFrom(tokenHolder1, tokenHolder2, _transferAmount, { from: spender }));
          });
        });

        describe('when the initial holder does not have enough balance', function () {
          const _transferAmount = mintAmount.addn(1);

          it('reverts', async function () {
            await shouldFail.reverting(this.icToken.transferFrom(tokenHolder1, tokenHolder2, _transferAmount, { from: spender }));
          });
        });
      });
    });

    describe('when the recipient is the zero address', function () {
      beforeEach(async function () {
        await this.icToken.approve(spender, approveAmount, { from: tokenHolder1 });
      });

      it('reverts', async function () {
        await shouldFail.reverting(this.icToken.transferFrom(tokenHolder1, ZERO_ADDRESS, transferAmount, { from: spender }));
      });
    });
  });

  // TODO: write e2e tests
  describe.skip('end-to-end test', function () {
  });
});
