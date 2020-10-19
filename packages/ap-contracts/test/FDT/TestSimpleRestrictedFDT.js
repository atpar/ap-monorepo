/*jslint node*/
/*global before, beforeEach, describe, it, web3*/
const buidlerRuntime = require('@nomiclabs/buidler');
const { BN, /*balance,*/ ether, shouldFail } = require('openzeppelin-test-helpers');

const { expectEvent, ZERO_ADDRESS } = require('../helper/utils/utils');
const {
  getSnapshotTaker, deployPaymentToken, deploySimpleRestrictedFDT,
} = require('../helper/setupTestEnvironment');


describe('SimpleRestrictedFDT', () => {
  let owner, tokenHolder1, tokenHolder2, tokenHolder3, anyone, spender;
  const gasPrice = new BN('1');

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [ owner, tokenHolder1, tokenHolder2, tokenHolder3, anyone ] = self.accounts;
    spender = anyone;

    self.fundsToken = await deployPaymentToken( // test ERC20
      buidlerRuntime, owner,[tokenHolder1, tokenHolder2, tokenHolder3, anyone],
    );
    self.fundsDistributionToken = await deploySimpleRestrictedFDT(
      buidlerRuntime, { owner, fundsToken: self.fundsToken.options.address },
    );
    await self.fundsDistributionToken.methods.addAdmin(owner).send({from: owner});
    await self.fundsDistributionToken.methods.updateOutboundWhitelistEnabled('1', '1', true).send({from: owner});
    await self.fundsDistributionToken.methods.addToWhitelist(tokenHolder1, '1').send({from: owner});
    await self.fundsDistributionToken.methods.addToWhitelist(tokenHolder2, '1').send({from: owner});
    await self.fundsDistributionToken.methods.addToWhitelist(tokenHolder3, '1').send({from: owner});
    await self.fundsDistributionToken.methods.addToWhitelist(anyone, '1').send({from: owner});
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
  });

  // before each `it`, even in `describe`
  beforeEach(async () => {
    await this.setupTestEnvironment();
  });

  describe('mint', () => {
    describe('when someone other than the owner tries to mint tokens', () => {
      it('reverts', async () => {
        await shouldFail.reverting(
            this.fundsDistributionToken.methods.mint(anyone, ether('1').toString())
                .send({from: anyone})
        );
      });
    });

    describe('when the contract owner tries to mint tokens', () => {
      describe('when the recipient is the zero address', () => {
        it('reverts', async () => {
          await shouldFail.reverting(
              this.fundsDistributionToken.methods.mint(ZERO_ADDRESS, ether('1').toString())
                  .send({from: owner})
          );
        });
      });

      describe('when the recipient is not the zero address', () => {
        it('mint tokens to the recipient', async () => {
          await this.fundsDistributionToken.methods.mint(tokenHolder1, ether('1').toString())
              .send({from: owner});

          (await this.fundsDistributionToken.methods.balanceOf(tokenHolder1).call())
              .should.be.equal(ether('1').toString());
          (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());
          (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());
          (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());
        });
      });
    });
  });

  describe('sending funds', () => {
    describe('when anyone tries to pay and distribute funds', () => {
      describe('when the total supply is 0', () => {
        it('reverts', async () => {
          await this.fundsToken.methods
              .transfer(this.fundsDistributionToken.options.address, ether('1').toString())
              .send({from: anyone});
          await shouldFail.reverting(
              this.fundsDistributionToken.methods.updateFundsReceived()
                  .send({from: anyone})
          );
        });
      });

      describe('when paying 0 ether', () => {
        it('should succeed but nothing happens', async () => {
          await this.fundsDistributionToken.methods.mint(tokenHolder1, ether('1').toString())
              .send({from: owner});

          // await this.fundsDistributionToken.methods.distributeFunds()
          //   .send({from: anyone, value: ether('0').toString()});
          await this.fundsToken.methods
              .transfer(this.fundsDistributionToken.options.address, ether('0').toString())
              .send({from: anyone});
          await this.fundsDistributionToken.methods.updateFundsReceived()
              .send({from: anyone});

          (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());
          (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());
          (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());
        });
      });

      describe('when the total supply is not 0', () => {
        it('should pay and distribute funds to token holders', async () => {
          await this.fundsDistributionToken.methods.mint(tokenHolder1, ether('1').toString())
              .send({from: owner});
          await this.fundsDistributionToken.methods.mint(tokenHolder2, ether('3').toString())
              .send({from: owner});

          // const { events } = await this.fundsDistributionToken.sendTransaction()
          //   .send({from: anyone, value: ether('1').toString()});
          // expectEvent(events, 'FundsDistributed', {
          //     from: anyone,
          //     weiAmount: ether('1').toString(),
          //   }
          // );
          await this.fundsToken.methods
              .transfer(this.fundsDistributionToken.options.address, ether('1').toString())
              .send({from: anyone});
          const { events } = await this.fundsDistributionToken.methods.updateFundsReceived()
              .send({from: anyone});
          expectEvent(events, 'FundsDistributed', {
            by: anyone,
            fundsDistributed: ether('1').toString(),
          });

          (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0.25').toString());
          (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0.25').toString());
          (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());

          (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder2).call())
              .should.be.equal(ether('0.75').toString());
          (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder2).call())
              .should.be.equal(ether('0.75').toString());
          (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder2).call())
              .should.be.equal(ether('0').toString());
        });
      });
    });

    describe('when anyone tries to pay and distribute funds by sending ether to the contract', () => {
      describe('when the total supply is 0', () => {
        it('reverts', async () => {
          await this.fundsToken.methods
              .transfer(this.fundsDistributionToken.options.address, ether('1').toString())
              .send({from: anyone});
          await shouldFail.reverting(
              this.fundsDistributionToken.methods.updateFundsReceived()
                  .send({from: anyone})
          );
        });
      });

      describe('when paying 0 ether', () => {
        it('should succeed but nothing happens', async () => {
          await this.fundsDistributionToken.methods.mint(tokenHolder1, ether('1').toString())
              .send({from: owner});

          // await this.fundsDistributionToken.sendTransaction()
          //   .send({from: anyone, value: ether('0').toString()});
          await this.fundsToken.methods
              .transfer(this.fundsDistributionToken.options.address, ether('0').toString())
              .send({from: anyone});
          await this.fundsDistributionToken.methods.updateFundsReceived()
              .send({from: anyone});

          (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());
          (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());
          (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());
        });
      });

      describe('when the total supply is not 0', () => {
        it('should pay and distribute funds to token holders', async () => {
          await this.fundsDistributionToken.methods.mint(tokenHolder1, ether('1').toString())
              .send({from: owner});
          await this.fundsDistributionToken.methods.mint(tokenHolder2, ether('3').toString())
              .send({from: owner});

          // const { events } = await this.fundsDistributionToken.sendTransaction()
          //   .send({from: anyone, value: ether('1').toString()});
          // expectEvent(events, 'FundsDistributed', {
          //     from: anyone,
          //     weiAmount: ether('1').toString(),
          //   }
          // );
          await this.fundsToken.methods
              .transfer(this.fundsDistributionToken.options.address, ether('1').toString())
              .send({from: anyone});
          const { events } = await this.fundsDistributionToken.methods.updateFundsReceived()
              .send({from: anyone});
          expectEvent(events, 'FundsDistributed', {
            by: anyone,
            fundsDistributed: ether('1').toString(),
          });

          (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0.25').toString());
          (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder2).call())
              .should.be.equal(ether('0.75').toString());
        });
      });
    });
  });

  describe('transfer', () => {
    beforeEach(async () => {
      await this.fundsDistributionToken.methods.mint(tokenHolder1, ether('1').toString())
          .send({from: owner});
    });

    describe('when the recipient is the zero address', () => {
      it('reverts', async () => {
        await shouldFail.reverting(
            this.fundsDistributionToken.methods.transfer(ZERO_ADDRESS, ether('0.5').toString())
                .send({from: tokenHolder1})
        );
      });
    });

    describe('when the recipient is not the zero address', () => {
      describe('when the sender does not have enough balance', () => {
        it('reverts', async () => {
          await shouldFail.reverting(
              this.fundsDistributionToken.methods.transfer(tokenHolder2, ether('2').toString())
                  .send({from: tokenHolder1})
          );
        });
      });

      describe('when the sender has enough balance', () => {
        it('transfers the requested amount', async () => {
          await this.fundsDistributionToken.methods.transfer(tokenHolder2, ether('0.25').toString())
              .send({from: tokenHolder1});

          (await this.fundsDistributionToken.methods.balanceOf(tokenHolder1).call())
              .should.be.equal(ether('0.75').toString());
          (await this.fundsDistributionToken.methods.balanceOf(tokenHolder2).call())
              .should.be.equal(ether('0.25').toString());
        });

        it('emits a transfer event', async () => {
          const { events } = await this.fundsDistributionToken.methods
              .transfer(tokenHolder2, ether('0.25').toString())
              .send({from: tokenHolder1});
          expectEvent(events, 'Transfer', {
            from: tokenHolder1,
            to: tokenHolder2,
            value: ether('0.25').toString(),
          });
        });
      });
    });
  });

  describe('transfer from', () => {
    const mintAmount = ether('9');
    const approveAmount = ether('3');
    const transferAmount = ether('1');

    beforeEach(async () => {
      await this.fundsDistributionToken.methods.mint(tokenHolder1, mintAmount.toString())
          .send({from: owner});
    });

    describe('when the recipient is not the zero address', () => {
      describe('when the spender has enough approved balance', () => {
        beforeEach(async () => {
          await this.fundsDistributionToken.methods.approve(spender, approveAmount.toString())
              .send({from: tokenHolder1});
        });

        describe('when the initial holder has enough balance', () => {
          let events;

          beforeEach(async () => {
            const receipt = await this.fundsDistributionToken.methods
                .transferFrom(tokenHolder1, tokenHolder2, transferAmount.toString())
                .send({from: spender});
            events = receipt.events;
          });

          it('transfers the requested amount', async () => {
            (await this.fundsDistributionToken.methods.balanceOf(tokenHolder1).call())
                .should.be.equal( mintAmount.sub(transferAmount).toString() );
            (await this.fundsDistributionToken.methods.balanceOf(tokenHolder2).call())
                .should.be.equal( transferAmount.toString() );
          });

          it('decreases the spender allowance', async () => {
            (await this.fundsDistributionToken.methods.allowance(tokenHolder1, spender).call())
                .should.be.equal( approveAmount.sub(transferAmount).toString() );
          });

          it('emits a transfer event', async () => {
            expectEvent(events, 'Transfer', {
              from: tokenHolder1,
              to: tokenHolder2,
              value: transferAmount.toString(),
            });
          });

          it('emits an approval event', async () => {
            expectEvent(events, 'Approval', {
              owner: tokenHolder1,
              spender: spender,
              value: approveAmount.sub(transferAmount).toString(),
            });
          });
        });

        describe('when the initial holder does not have enough balance', () => {
          const _approveAmount = mintAmount.addn(1);
          const _transferAmount = _approveAmount;

          beforeEach(async () => {
            await this.fundsDistributionToken.methods.approve(spender, _approveAmount.toString())
                .send({from: tokenHolder1});
          });

          it('reverts', async () => {
            await shouldFail.reverting(this.fundsDistributionToken.methods
                .transferFrom(tokenHolder1, tokenHolder2, _transferAmount.toString())
                .send({from: spender}));
          });
        });
      });

      describe('when the spender does not have enough approved balance', () => {
        beforeEach(async () => {
          await this.fundsDistributionToken.methods.approve(spender, approveAmount.toString())
              .send({from: tokenHolder1});
        });

        describe('when the initial holder has enough balance', () => {
          const _transferAmount = approveAmount.addn(1);

          it('reverts', async () => {
            await shouldFail.reverting(this.fundsDistributionToken.methods
                .transferFrom(tokenHolder1, tokenHolder2, _transferAmount.toString())
                .send({from: spender}));
          });
        });

        describe('when the initial holder does not have enough balance', () => {
          const _transferAmount = mintAmount.addn(1);

          it('reverts', async () => {
            await shouldFail.reverting(this.fundsDistributionToken.methods
                .transferFrom(tokenHolder1, tokenHolder2, _transferAmount.toString())
                .send({from: spender}));
          });
        });
      });
    });

    describe('when the recipient is the zero address', () => {
      beforeEach(async () => {
        await this.fundsDistributionToken.methods.approve(spender, approveAmount.toString())
            .send({from: tokenHolder1});
      });

      it('reverts', async () => {
        await shouldFail.reverting(this.fundsDistributionToken.methods
            .transferFrom(tokenHolder1, ZERO_ADDRESS, transferAmount.toString())
            .send({from: spender}));
      });
    });
  });

  describe('withdrawFunds', () => {
    it('should be able to withdraw funds', async () => {
      await this.fundsDistributionToken.methods.mint(tokenHolder1, ether('1').toString())
          .send({from: owner});
      await this.fundsDistributionToken.methods.mint(tokenHolder2, ether('3').toString())
          .send({from: owner});
      // await this.fundsDistributionToken.methods.distributeFunds()
      //   .send({from: anyone, value: ether('1').toString()});
      await this.fundsToken.methods
          .transfer(this.fundsDistributionToken.options.address, ether('1').toString())
          .send({from: anyone});
      await this.fundsDistributionToken.methods.updateFundsReceived()
          .send({from: anyone});

      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());

      // const balance1 = await balance.current(tokenHolder1).call();
      const balance1 = await this.fundsToken.methods.balanceOf(tokenHolder1).call();
      const { events } = await this.fundsDistributionToken.methods.withdrawFunds()
          .send({from: tokenHolder1, gasPrice: gasPrice});
      expectEvent(events, 'FundsWithdrawn', {
            by: tokenHolder1,
            fundsWithdrawn: ether('0.25').toString(),
          }
      );

      // const balance2 = await balance.current(tokenHolder1);
      const balance2 = await this.fundsToken.methods.balanceOf(tokenHolder1).call();
      // const fee = gasPrice.mul(new BN(receipt.receipt.gasUsed));
      // balance2.should.be.equal( balance1.add(ether('0.25').toString()).sub(fee) );
      balance2.should.be.equal((new BN(balance1)).add(ether('0.25')).toString());

      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());

      // withdraw again. should succeed and withdraw nothing
      // const receipt2 = await this.fundsDistributionToken.methods.withdrawFunds()
      //   .send({from: tokenHolder1, gasPrice: gasPrice});
      // const balance3 = await balance.current(tokenHolder1);
      const balance3 = await this.fundsToken.methods.balanceOf(tokenHolder1).call();
      // const fee2 = gasPrice.mul(new BN(receipt2.receipt.gasUsed));
      // balance3.should.be.equal( balance2.sub(fee2).toString());
      balance3.should.be.equal(balance2);

      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
    });
  });

  describe('keep funds unchanged in several cases', () => {
    it('should keep funds unchanged after minting tokens', async () => {
      await this.fundsDistributionToken.methods.mint(tokenHolder1, ether('1').toString(),)
          .send({from: owner});
      await this.fundsDistributionToken.methods.mint(tokenHolder2, ether('3').toString())
          .send({from: owner});
      // await this.fundsDistributionToken.methods
      //   .distributeFunds({from: anyone, value: ether('1').toString()})
      //   .send({from: anyone});
      await this.fundsToken.methods
          .transfer(this.fundsDistributionToken.options.address, ether('1').toString())
          .send({from: anyone});
      await this.fundsDistributionToken.methods.updateFundsReceived()
          .send({from: anyone});

      await this.fundsDistributionToken.methods.mint(tokenHolder1, ether('1').toString())
          .send({from: owner});

      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());
    });

    it('should keep funds unchanged after transferring tokens', async () => {
      await this.fundsDistributionToken.methods.mint(tokenHolder1, ether('1').toString())
          .send({from: owner});
      await this.fundsDistributionToken.methods.mint(tokenHolder2, ether('3').toString())
          .send({from: owner});
      // await this.fundsDistributionToken.methods.distributeFunds()
      //   .send({from: anyone, value: ether('1').toString()});
      await this.fundsToken.methods
          .transfer(this.fundsDistributionToken.options.address, ether('1').toString())
          .send({from: anyone});
      await this.fundsDistributionToken.methods.updateFundsReceived()
          .send({from: anyone});

      await this.fundsDistributionToken.methods.transfer(tokenHolder2, ether('1').toString())
          .send({from: tokenHolder1});

      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());

      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0.75').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0.75').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());
    });

    it('should keep funds unchanged after transferFrom', async () => {
      await this.fundsDistributionToken.methods.mint(tokenHolder1, ether('1').toString())
          .send({from: owner});
      await this.fundsDistributionToken.methods.mint(tokenHolder2, ether('3').toString())
          .send({from: owner});
      // await this.fundsDistributionToken.methods
      //   .distributeFunds({from: anyone, value: ether('1').toString()})
      //   .send({from: anyone});
      await this.fundsToken.methods
          .transfer(this.fundsDistributionToken.options.address, ether('1').toString())
          .send({from: anyone});
      await this.fundsDistributionToken.methods.updateFundsReceived()
          .send({from: anyone});

      await this.fundsDistributionToken.methods.approve(tokenHolder3, ether('1').toString())
          .send({from: tokenHolder1});
      await this.fundsDistributionToken.methods
          .transferFrom(tokenHolder1, tokenHolder2, ether('1').toString())
          .send({from: tokenHolder3});

      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());

      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0.75').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0.75').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());
    });

    it('should correctly distribute funds after transferring tokens', async () => {
      await this.fundsDistributionToken.methods.mint(tokenHolder1, ether('2').toString())
          .send({from: owner});
      await this.fundsDistributionToken.methods.mint(tokenHolder2, ether('3').toString())
          .send({from: owner});
      // await this.fundsDistributionToken.methods.distributeFunds()
      //   .send({from: anyone, value: ether('5').toString()});
      await this.fundsToken.methods
          .transfer(this.fundsDistributionToken.options.address, ether('5').toString())
          .send({from: anyone});
      await this.fundsDistributionToken.methods.updateFundsReceived()
          .send({from: anyone});

      await this.fundsDistributionToken.methods.transfer(tokenHolder2, ether('1').toString())
          .send({from: tokenHolder1});
      // await this.fundsDistributionToken.methods.distributeFunds()
      //   .send({from: anyone, value: ether('50').toString()});
      await this.fundsToken.methods
          .transfer(this.fundsDistributionToken.options.address, ether('50').toString())
          .send({from: anyone});
      await this.fundsDistributionToken.methods.updateFundsReceived()
          .send({from: anyone});

      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('12').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('12').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());

      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder2).call())
          .should.be.equal(ether('43').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder2).call())
          .should.be.equal(ether('43').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());
    });
  });

  describe('end-to-end test', () => {
    it('should pass end-to-end test', async () => {
      let balanceBefore;
      let balanceAfter;
      // let receipt;
      // let fee;

      // mint and distributeFunds
      await this.fundsDistributionToken.methods.mint(tokenHolder1, ether('2').toString())
          .send({from: owner});
      // await this.fundsDistributionToken.methods.distributeFunds()
      //   .send({from: anyone, value: ether('10').toString()});
      await this.fundsToken.methods
          .transfer(this.fundsDistributionToken.options.address, ether('10').toString())
          .send({from: anyone});
      await this.fundsDistributionToken.methods.updateFundsReceived()
          .send({from: anyone});

      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call()).
      should.be.equal(ether('10').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());

      // transfer
      await this.fundsDistributionToken.methods.transfer(tokenHolder2, ether('2').toString())
          .send({from: tokenHolder1});
      (await this.fundsDistributionToken.methods.balanceOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());
      (await this.fundsDistributionToken.methods.balanceOf(tokenHolder2).call())
          .should.be.equal(ether('2').toString());
      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());
      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());

      // tokenHolder1 withdraw
      // balanceBefore = await balance.current(tokenHolder1).call();
      // receipt = await this.fundsDistributionToken.methods.withdrawFunds()
      //   .send({from: tokenHolder1, gasPrice: gasPrice});
      // balanceAfter = await balance.current(tokenHolder1).call();
      // fee = gasPrice.mul(new BN(receipt.receipt.gasUsed));
      // balanceAfter.should.be.equal( balanceBefore.add(ether('10').sub(fee).toString());
      balanceBefore = await this.fundsToken.methods.balanceOf(tokenHolder1).call();
      await this.fundsDistributionToken.methods.withdrawFunds()
          .send({from: tokenHolder1});
      balanceAfter = await this.fundsToken.methods.balanceOf(tokenHolder1).call();
      balanceAfter.should.be.equal((new BN(balanceBefore)).add(ether('10')).toString());

      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());

      // deposit
      // await this.fundsDistributionToken.methods.distributeFunds()
      //   .send({from: anyone, value: ether('10').toString()});
      await this.fundsToken.methods
          .transfer(this.fundsDistributionToken.options.address, ether('10').toString())
          .send({from: anyone});
      await this.fundsDistributionToken.methods.updateFundsReceived()
          .send({from: anyone});
      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());
      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder2).call())
          .should.be.equal(ether('10').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder2).call())
          .should.be.equal(ether('10').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());

      // mint
      await this.fundsDistributionToken.methods.mint(tokenHolder1, ether('3').toString())
          .send({from: owner});
      (await this.fundsDistributionToken.methods.balanceOf(tokenHolder1).call())
          .should.be.equal(ether('3').toString());

      // deposit
      // await this.fundsDistributionToken.methods.distributeFunds()
      //   .send({from: anyone, value: ether('10').toString()});
      await this.fundsToken.methods
          .transfer(this.fundsDistributionToken.options.address, ether('10').toString())
          .send({from: anyone});
      await this.fundsDistributionToken.methods.updateFundsReceived()
          .send({from: anyone});
      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('16').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('6').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());
      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder2).call())
          .should.be.equal(ether('14').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder2).call())
          .should.be.equal(ether('14').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());

      // now tokens: 3, 2

      await this.fundsDistributionToken.methods.transfer(tokenHolder3, ether('2').toString())
          .send({from: tokenHolder2});

      // 3, 0, 2

      await this.fundsDistributionToken.methods.mint(tokenHolder2, ether('4').toString())
          .send({from: owner});
      await this.fundsDistributionToken.methods.mint(tokenHolder3, ether('1').toString())
          .send({from: owner});

      // 3 4 3

      await this.fundsDistributionToken.methods.transfer(tokenHolder1, ether('2').toString())
          .send({from: tokenHolder2});

      // 5 2 3

      await this.fundsDistributionToken.methods.transfer(tokenHolder3, ether('5').toString())
          .send({from: tokenHolder1});

      // 0 2 8

      await this.fundsDistributionToken.methods.transfer(tokenHolder2, ether('2').toString())
          .send({from: tokenHolder3});

      // 0 4 6

      await this.fundsDistributionToken.methods.transfer(tokenHolder1, ether('3').toString())
          .send({from: tokenHolder2});

      // 3, 1, 6

      (await this.fundsDistributionToken.methods.balanceOf(tokenHolder1).call())
          .should.be.equal(ether('3').toString());
      (await this.fundsDistributionToken.methods.balanceOf(tokenHolder2).call())
          .should.be.equal(ether('1').toString());
      (await this.fundsDistributionToken.methods.balanceOf(tokenHolder3).call())
          .should.be.equal(ether('6').toString());

      // deposit
      // await this.fundsDistributionToken.methods.distributeFunds()
      //   .send({from: anyone, value: ether('10').toString()});
      await this.fundsToken.methods
          .transfer(this.fundsDistributionToken.options.address, ether('10').toString())
          .send({from: anyone});
      await this.fundsDistributionToken.methods.updateFundsReceived()
          .send({from: anyone});
      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('19').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('9').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());
      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder2).call())
          .should.be.equal(ether('15').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder2).call())
          .should.be.equal(ether('15').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());
      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder3).call())
          .should.be.equal(ether('6').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder3).call())
          .should.be.equal(ether('6').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder3).call())
          .should.be.equal(ether('0').toString());


      // tokenHolder1 withdraw
      // balanceBefore = await balance.current(tokenHolder1);
      // receipt = await this.fundsDistributionToken.methods.withdrawFunds()
      //   .send({from: tokenHolder1, gasPrice: gasPrice});
      // balanceAfter = await balance.current(tokenHolder1);
      // fee = gasPrice.mul(new BN(receipt.receipt.gasUsed));
      // balanceAfter.should.be.equal( balanceBefore.add(ether('9').sub(fee).toString());
      balanceBefore = await this.fundsToken.methods.balanceOf(tokenHolder1).call();
      await this.fundsDistributionToken.methods.withdrawFunds()
          .send({from: tokenHolder1});
      balanceAfter = await this.fundsToken.methods.balanceOf(tokenHolder1).call();
      balanceAfter.should.be.equal((new BN(balanceBefore)).add(ether('9')).toString());
      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('19').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('19').toString());

      // tokenHolder2 withdraw
      // balanceBefore = await balance.current(tokenHolder2);
      // receipt = await this.fundsDistributionToken.methods.withdrawFunds()
      //   .send({from: tokenHolder2, gasPrice: gasPrice});
      // balanceAfter = await balance.current(tokenHolder2);
      // fee = gasPrice.mul(new BN(receipt.receipt.gasUsed));
      // balanceAfter.should.be.equal( balanceBefore.add(ether('15').sub(fee).toString());
      balanceBefore = await this.fundsToken.methods.balanceOf(tokenHolder2).call();
      await this.fundsDistributionToken.methods.withdrawFunds()
          .send({from: tokenHolder2});
      balanceAfter = await this.fundsToken.methods.balanceOf(tokenHolder2).call();
      balanceAfter.should.be.equal((new BN(balanceBefore)).add(ether('15')).toString());
      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder2).call())
          .should.be.equal(ether('15').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder2).call())
          .should.be.equal(ether('15').toString());

      // tokenHolder3 withdraw
      // balanceBefore = await balance.current(tokenHolder3);
      // receipt = await this.fundsDistributionToken.methods.withdrawFunds()
      //   .send({from: tokenHolder3, gasPrice: gasPrice});
      // balanceAfter = await balance.current(tokenHolder3);
      // fee = gasPrice.mul(new BN(receipt.receipt.gasUsed));
      // balanceAfter.should.be.equal( balanceBefore.add(ether('6').sub(fee).toString());
      balanceBefore = await this.fundsToken.methods.balanceOf(tokenHolder3).call();
      await this.fundsDistributionToken.methods.withdrawFunds()
          .send({from: tokenHolder3});
      balanceAfter = await this.fundsToken.methods.balanceOf(tokenHolder3).call();
      balanceAfter.should.be.equal((new BN(balanceBefore)).add(ether('6')).toString());
      (await this.fundsDistributionToken.methods.accumulativeFundsOf(tokenHolder3).call())
          .should.be.equal(ether('6').toString());
      (await this.fundsDistributionToken.methods.withdrawableFundsOf(tokenHolder3).call())
          .should.be.equal(ether('0').toString());
      (await this.fundsDistributionToken.methods.withdrawnFundsOf(tokenHolder3).call())
          .should.be.equal(ether('6').toString());
    });
  });
});
