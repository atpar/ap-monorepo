/* jslint node */
/* global before, beforeEach, contract, describe, it, web3 */
const assert = require('assert');
const bre = require('@nomiclabs/buidler');
const BigNumber = require('bignumber.js');
const { shouldFail } = require('openzeppelin-test-helpers');

const { expectEvent, ZERO_ADDRESS } = require('../helper/utils');
const { deployICToken, getSnapshotTaker } = require('../helper/setupTestEnvironment');


describe('ICT', () => {
  let owner, tokenHolder1, tokenHolder2, spender;

  const mintAmount = web3.utils.toWei('9');
  const mintAmountPlusOne = (new BigNumber(mintAmount)).plus(1).toString();
  const transferAmount = web3.utils.toWei('1');
  const mintAmountMinusTransferAmount = web3.utils.toWei('8');
  const approveAmount = web3.utils.toWei('3');
  const approveAmountPlusOne = (new BigNumber(approveAmount)).plus(1).toString();
  const approvedTransferAmount = web3.utils.toWei('2.5');
  const approveAmountMinusApprovedTransferAmount = web3.utils.toWei('0.5');
  const mintAmountMinusApprovedTransferAmount = web3.utils.toWei('6.5');

  const ictParams = {
    name: "Investment Certificate Token",
    symbol: "ICT",
    marketObjectCode: web3.utils.hexToBytes('0xADDA')
  };

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(bre, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [ deployer, /*actor*/, owner, tokenHolder1, tokenHolder2, spender ] = self.accounts;

    ictParams.assetRegistry = self.CERTFRegistryInstance.options.address;
    ictParams.dataRegistry = self.DataRegistryInstance.options.address;
    ictParams.deployer = owner;

    self.icToken = await deployICToken(bre, ictParams);

    await self.icToken.methods.mint(tokenHolder1, mintAmount).send({ from: owner });
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
  });

  beforeEach(async () => {
    await this.setupTestEnvironment();
  });

  describe('constructor', () => {

    describe('When called with valid asset and data registry addresses', () => {
      it('does NOT revert', async () =>
          deployICToken(bre, Object.assign({}, ictParams))
      );
    });

    describe('When called with zero address of the asset registry', () => {
      it('reverts', async () => await shouldFail.reverting(
          deployICToken(bre, Object.assign({}, ictParams, { assetRegistry: ZERO_ADDRESS }))
      ));
    });

    describe('When called with zero address of the data registry', () => {
      it('reverts', async () => await shouldFail.reverting(
          deployICToken(bre, Object.assign({}, ictParams, { dataRegistry: ZERO_ADDRESS }))
      ));
    });

    describe('When called with the asset registry address bing EOA', () => {
      it('reverts', async () => await shouldFail.reverting(
          deployICToken(bre, Object.assign({}, ictParams, { assetRegistry: tokenHolder1 }))
      ));
    });

    describe('When called with the data registry address bing EOA', () => {
      it('reverts', async () => await shouldFail.reverting(
          deployICToken(bre, Object.assign({}, ictParams, { dataRegistry: tokenHolder1 }))
      ));
    });
  });

  describe('transfer', () => {

    describe('when the recipient is the zero address', () => {
      it('reverts', async () => await shouldFail.reverting(
            this.icToken.methods.transfer(ZERO_ADDRESS, transferAmount).send({ from: tokenHolder1 })
      ));
    });

    describe('when the recipient is not the zero address', () => {
      describe('when the sender does not have enough balance', () => {
        it('reverts', async () => await shouldFail.reverting(
              this.icToken.methods.transfer(tokenHolder1, transferAmount).send({ from: tokenHolder2 })
        ));
      });

      describe('when the sender has enough balance', () => {
        it('transfers the requested amount', async () => {
          await this.icToken.methods.transfer(tokenHolder2, transferAmount).send({ from: tokenHolder1 });

          assert.strictEqual(
              await this.icToken.methods.balanceOf(tokenHolder1).call(), mintAmountMinusTransferAmount
          );
          assert.strictEqual(await this.icToken.methods.balanceOf(tokenHolder2).call(), transferAmount);
        });

        it('emits a transfer event', async () => {
          const { events } = await this.icToken.methods.transfer(
              tokenHolder2, transferAmount
          ).send({ from: tokenHolder1 });

          expectEvent(events, 'Transfer', {
            from: tokenHolder1, to: tokenHolder2, value: transferAmount,
          });
        });
      });
    });
  });

  describe('transfer from', () => {

    describe('when the recipient is not the zero address', () => {

      describe('when the spender has enough approved balance', () => {

        describe('when the initial holder has enough balance', () => {
          let events_approve, events_transfer;

          beforeEach(async () => {
            events_approve = (await this.icToken.methods.approve(
                spender, approveAmount
            ).send({ from: tokenHolder1 })).events;
            events_transfer = (await this.icToken.methods.transferFrom(
                tokenHolder1, tokenHolder2, approvedTransferAmount
            ).send({ from: spender })).events;
          });

          it('transfers the requested amount', async () => {
            assert.strictEqual(
                await this.icToken.methods.balanceOf(tokenHolder1).call(),
                mintAmountMinusApprovedTransferAmount
            );
            assert.strictEqual(
                await this.icToken.methods.balanceOf(tokenHolder2).call(),
                approvedTransferAmount
            );
          });

          it('decreases the spender allowance', async () => {
            assert.strictEqual(
                await this.icToken.methods.allowance(tokenHolder1, spender).call(),
                approveAmountMinusApprovedTransferAmount
            );
          });

          it('emits an approval event', async () => {
            expectEvent(events_approve, 'Approval', {
              owner: tokenHolder1, spender: spender, value: approveAmount,
            });
          });

          it('emits a transfer event', async () => {
            expectEvent(events_transfer, 'Transfer', {
              from: tokenHolder1, to: tokenHolder2, value: approvedTransferAmount,
            });
          });
        });

        describe('when the initial holder does not have enough balance', () => {
          beforeEach(async () => {
            await this.icToken.methods.approve(spender, mintAmountPlusOne).send({ from: tokenHolder1 });
          });

          it('reverts', async () => {
            await shouldFail.reverting(
                this.icToken.methods.transferFrom(
                    tokenHolder1, tokenHolder2, mintAmountPlusOne
                ).send({ from: spender }));
          });
        });
      });

      describe('when the spender does not have enough approved balance', () => {
        beforeEach(async () => {
          await this.icToken.methods.approve(spender, approveAmount).send({ from: tokenHolder1 });
        });

        describe('when the initial holder has enough balance', () => {
          it('reverts', async () => await shouldFail.reverting(
                this.icToken.methods.transferFrom(
                    tokenHolder1, tokenHolder2, approveAmountPlusOne
                ).send({ from: spender })
          ));
        });

        describe('when the initial holder does not have enough balance', () => {
          it('reverts', async () => await shouldFail.reverting(
                this.icToken.methods.transferFrom(tokenHolder1, tokenHolder2, mintAmountPlusOne)
                    .send({ from: spender })
          ));
        });
      });
    });

    describe('when the recipient is the zero address', () => {
      beforeEach(async () => {
        await this.icToken.methods.approve(spender, approveAmount).send({ from: tokenHolder1 });
      });

      it('reverts', async () => {
        await shouldFail.reverting(
            this.icToken.methods.transferFrom(
                tokenHolder1, ZERO_ADDRESS, transferAmount
            ).send({ from: spender })
        );
      });
    });
  });

  // TODO: write e2e tests
  describe.skip('end-to-end test', () => {
  });
});
