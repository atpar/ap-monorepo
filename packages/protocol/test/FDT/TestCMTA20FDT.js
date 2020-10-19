const buidlerRuntime = require('@nomiclabs/buidler');
const { BN, ether, shouldFail } = require('openzeppelin-test-helpers');

const { expectEvent, ZERO_ADDRESS } = require('../helper/utils/utils');
const {
  getSnapshotTaker, deployPaymentToken, deployCMTA20FDT, deployRuleEngineMock
} = require('../helper/setupTestEnvironment');


describe('CMTA20', () => {
  
  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [ owner, tokenHolder1, tokenHolder2, tokenHolder3, fakeRuleEngine, anyone ] = self.accounts;
    spender = anyone;

    self.fundsToken = await deployPaymentToken( // test ERC20
      buidlerRuntime, owner, [tokenHolder1, tokenHolder2, tokenHolder3, anyone],
    );

    self.cmta20 = await deployCMTA20FDT(
      buidlerRuntime,
      {
        owner,
        name: 'CMTA 20',
        symbol: 'CMTA20',
        fundsToken: self.fundsToken.options.address
      },
    );

    self.ruleEngineMock = await deployRuleEngineMock(buidlerRuntime, { owner });
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
  });

  describe('Token structure', () => {
    it('has the defined name', async () => {
      (await this.cmta20.methods.name().call()).should.equal('CMTA 20');
    });
    it('has the defined symbol', async () => {
      (await this.cmta20.methods.symbol().call()).should.equal('CMTA20');
    });
    it('has no rule engine set by default', async () => {
      (await this.cmta20.methods.ruleEngine().call()).should.equal('0x0000000000000000000000000000000000000000');
    });
    // it('cannot be fractionned', async () => {
    //   (await this.cmta20.methods.decimals().call()).should.equal('0');
    // });
  });

  describe('Rule Engine', () => {
    it('can be changed by the owner', async () => {
      this.receipt = await this.cmta20.methods.setRuleEngine(fakeRuleEngine).send({from: owner});
    }); 
    
    it('emits a LogRuleEngineSet event', () => {
      expectEvent(this.receipt.events, 'LogRuleEngineSet', { newRuleEngine: fakeRuleEngine });
    });

    it('reverts when calling from non-owner', async () => {
      await shouldFail.reverting(this.cmta20.methods.setRuleEngine(fakeRuleEngine).send({ from: tokenHolder1 }));
    });
  });

  describe('Contact', () => {
    it('can be changed by the owner', async () => {
      this.receipt = await this.cmta20.methods.setContact('admin2@cmta.ch').send({from: owner});
    }); 

    it('emits a LogContactSet event', () => {
      expectEvent(this.receipt.events, 'LogContactSet', { contact: 'admin2@cmta.ch' });
    });

    it('reverts when calling from non-owner', async () => {
      await shouldFail.reverting(this.cmta20.methods.setContact('admin2@cmta.ch').send({ from: tokenHolder1 }));
    });
  });

  describe('Identities', () => {
    it('can be set by the shareholder and read from owner', async () => {
      await this.cmta20.methods.setMyIdentity('0x1234567890').send({from: tokenHolder1});
      (await this.cmta20.methods.identity(tokenHolder1).call()).should.equal('0x1234567890');
    }); 
  });
  
  describe('Issuing', () => {
    it('can be issued as the owner', async () => {
      /* Check first balance */
      (await this.cmta20.methods.balanceOf(owner).call()).should.equal('0');

      /* Issue 20 and check balances and total supply */
      this.receipt1 = await this.cmta20.methods.issue(20).send({from: owner});
      (await this.cmta20.methods.balanceOf(owner).call()).should.equal('20');
      (await this.cmta20.methods.totalSupply().call()).should.equal('20');

      /* Issue 50 and check intermediate balances and total supply */
      this.receipt2 = await this.cmta20.methods.issue(50).send({from: owner});
      (await this.cmta20.methods.balanceOf(owner).call()).should.equal('70');
      (await this.cmta20.methods.totalSupply().call()).should.equal('70');
    }); 

    it('emits a Transfer event', () => {
      expectEvent(this.receipt1.events, 'Transfer', { from: ZERO_ADDRESS, to: owner, value: '20' });
      expectEvent(this.receipt2.events, 'Transfer', { from: ZERO_ADDRESS, to: owner, value: '50' });
    });

    it('emits a LogIssued event', () => {
      expectEvent(this.receipt1.events, 'LogIssued', { value: '20' });
      expectEvent(this.receipt2.events, 'LogIssued', { value: '50' });
    });

    it('reverts when issuing from non-owner', async () => {
      await shouldFail.reverting(this.cmta20.methods.issue(20).send({ from: tokenHolder1 }));
    });
  });

  describe('Redeeming', () => {
    beforeEach(async () => {
      await this.setupTestEnvironment();
      await this.cmta20.methods.issue(70).send({from: owner});
    });

    it('can be redeemed as the owner', async () => {
      /* Redeem 20 and check balances and total supply */
      this.receipt1 = await this.cmta20.methods.redeem(20).send({from: owner});
      (await this.cmta20.methods.balanceOf(owner).call()).should.equal('50');
      (await this.cmta20.methods.totalSupply().call()).should.equal('50');

      /* Redeem 50 and check balances and total supply */
      this.receipt2 = await this.cmta20.methods.redeem(50).send({from: owner});
      (await this.cmta20.methods.balanceOf(owner).call()).should.equal('0');
      (await this.cmta20.methods.totalSupply().call()).should.equal('0');
    }); 
    
    it('emits a Transfer event', () => {
      expectEvent(this.receipt1.events, 'Transfer', { from: owner, to: ZERO_ADDRESS, value: '20' });
      expectEvent(this.receipt2.events, 'Transfer', { from: owner, to: ZERO_ADDRESS, value: '50' });
    });

    it('emits a LogRedeemed event', () => {
      expectEvent(this.receipt1.events, 'LogRedeemed', { value: '20' });
      expectEvent(this.receipt2.events, 'LogRedeemed', { value: '50' });
    });

    it('reverts when redeeming from non-owner', async () => {
      await shouldFail.reverting(this.cmta20.methods.redeem(20).send({ from: tokenHolder1 }));
    });

    it('reverts when redeeming more than the owner balance', async () => {
      await shouldFail.reverting(this.cmta20.methods.redeem(100).send({ from: owner }));
    });
  });

  describe('Reassigning', () => {
    beforeEach(async () => {
      await this.setupTestEnvironment();
      await this.cmta20.methods.issue(70).send({from: owner});
      await this.cmta20.methods.transfer(tokenHolder1, 50).send({from: owner});
    });

    it('can be reassigned as the owner from tokenHolder1 to tokenHolder2', async () => {

      this.receipt = await this.cmta20.methods.reassign(tokenHolder1, tokenHolder2).send({from: owner});
      (await this.cmta20.methods.balanceOf(owner).call()).should.equal('20');
      (await this.cmta20.methods.balanceOf(tokenHolder1).call()).should.equal('0');
      (await this.cmta20.methods.balanceOf(tokenHolder2).call()).should.equal('50');
      (await this.cmta20.methods.totalSupply().call()).should.equal('70');
    }); 
    
    it('emits a LogReassigned event and a Transfer event', () => {
      expectEvent(this.receipt.events, 'LogReassigned', { original: tokenHolder1, replacement: tokenHolder2, value: '50' });
      // expectEvent(this.receipt.events, 'Transfer', { from: tokenHolder1, to: tokenHolder2, value: '50' });
    });

    it('reverts when reassigning from non-owner', async () => {
      await shouldFail.reverting(this.cmta20.methods.reassign(tokenHolder1, tokenHolder2).send({ from: tokenHolder3 }));
    });

    it('reverts when reassigning when contract is paused', async () => {
      await this.cmta20.methods.pause().send({from: owner});
      await shouldFail.reverting.withMessage(this.cmta20.methods.reassign(tokenHolder1, tokenHolder2).send({ from: owner }), 'Pausable: paused');
    });

    it('reverts when reassigning when original is 0x0', async () => {
      await shouldFail.reverting.withMessage(this.cmta20.methods.reassign(ZERO_ADDRESS, tokenHolder2).send({ from: owner }), 'CM01');
    });

    it('reverts when reassigning when original is 0x0', async () => {
      await shouldFail.reverting.withMessage(this.cmta20.methods.reassign(tokenHolder1, ZERO_ADDRESS).send({ from: owner }), 'CM02');
    });

    it('reverts when reassigning when original is the same as replacement', async () => {
      await shouldFail.reverting.withMessage(this.cmta20.methods.reassign(tokenHolder1, tokenHolder1).send({ from: owner }), 'CM03');
    });

    it('reverts when reassigning from an original address that holds not tokens', async () => {
      await shouldFail.reverting.withMessage(this.cmta20.methods.reassign(tokenHolder3, tokenHolder1).send({ from: owner }), 'CM05');
    });
  });

  describe('Destroying', () => {
    beforeEach(async () => {
      await this.setupTestEnvironment();
      await this.cmta20.methods.issue(100).send({from: owner});
      await this.cmta20.methods.transfer(tokenHolder1, 31).send({from: owner});
      await this.cmta20.methods.transfer(tokenHolder2, 32).send({from: owner});
      await this.cmta20.methods.transfer(tokenHolder3, 33).send({from: owner});
    });

    it('can be destroyed as the owner', async () => {
      this.receipt = await this.cmta20.methods.destroy([tokenHolder1, tokenHolder2]).send({from: owner});
      (await this.cmta20.methods.balanceOf(owner).call()).should.equal('67');
      (await this.cmta20.methods.balanceOf(tokenHolder1).call()).should.equal('0');
      (await this.cmta20.methods.balanceOf(tokenHolder2).call()).should.equal('0');
      (await this.cmta20.methods.balanceOf(tokenHolder3).call()).should.equal('33');
      (await this.cmta20.methods.totalSupply().call()).should.equal('100');
    }); 
    
    it('emits a LogDestroyed event and multiple Transfer events', () => {
      expectEvent(this.receipt.events, 'LogDestroyed', { });
      // expectEvent(this.receipt.events, 'Transfer', { from: tokenHolder1, to: owner, value: '31' });
      // expectEvent(this.receipt.events, 'Transfer', { from: tokenHolder2, to: owner, value: '32' });
    });

    it('reverts when destroying from non-owner', async () => {
      await shouldFail.reverting(this.cmta20.methods.destroy([tokenHolder1, tokenHolder2]).send({ from: tokenHolder3 }));
    });

    it('reverts when destroying with owner contained in shareholders array', async () => {
      await shouldFail.reverting.withMessage(this.cmta20.methods.destroy([owner, tokenHolder1, tokenHolder2]).send({ from: owner }), 'CM06');
    });
  });

  describe('Allowing', () => {
    beforeEach(async () => {
      await this.setupTestEnvironment();
    });

    it('allows tokenHolder1 to define a spending allowance for tokenHolder3', async () => {
      (await this.cmta20.methods.allowance(tokenHolder1, tokenHolder3).call()).should.equal('0');
      this.receipt = await this.cmta20.methods.approve(tokenHolder3, 20).send({from: tokenHolder1});
      (await this.cmta20.methods.allowance(tokenHolder1, tokenHolder3).call()).should.equal('20');     
    });

    it('emits an Approval event', () => {
      expectEvent(this.receipt.events, 'Approval', { owner: tokenHolder1, spender: tokenHolder3, value: '20'});
    });

    it('allows tokenHolder1 to increase the allowance for tokenHolder3', async () => {
      (await this.cmta20.methods.allowance(tokenHolder1, tokenHolder3).call()).should.equal('0');
      await this.cmta20.methods.approve(tokenHolder3, 20).send({from: tokenHolder1});
      (await this.cmta20.methods.allowance(tokenHolder1, tokenHolder3).call()).should.equal('20');  
      this.receipt = await this.cmta20.methods.increaseAllowance(tokenHolder3, 10).send({from: tokenHolder1});
      (await this.cmta20.methods.allowance(tokenHolder1, tokenHolder3).call()).should.equal('30');           
    });

    it('emits an Approval event', () => {
      expectEvent(this.receipt.events, 'Approval', { owner: tokenHolder1, spender: tokenHolder3, value: '30'});
    });

    it('allows tokenHolder1 to decrease the allowance for tokenHolder3', async () => {
      (await this.cmta20.methods.allowance(tokenHolder1, tokenHolder3).call()).should.equal('0');
      await this.cmta20.methods.approve(tokenHolder3, 20).send({from: tokenHolder1});
      (await this.cmta20.methods.allowance(tokenHolder1, tokenHolder3).call()).should.equal('20');  
      this.receipt = await this.cmta20.methods.decreaseAllowance(tokenHolder3, 10).send({from: tokenHolder1});
      (await this.cmta20.methods.allowance(tokenHolder1, tokenHolder3).call()).should.equal('10');           
    });

    it('emits an Approval event', () => {
      expectEvent(this.receipt.events, 'Approval', { owner: tokenHolder1, spender: tokenHolder3, value: '10'});
    });

    it('allows tokenHolder1 to redefine a spending allowance for tokenHolder3', async () => {
      (await this.cmta20.methods.allowance(tokenHolder1, tokenHolder3).call()).should.equal('0');
      await this.cmta20.methods.approve(tokenHolder3, 20).send({from: tokenHolder1});
      (await this.cmta20.methods.allowance(tokenHolder1, tokenHolder3).call()).should.equal('20');     
      this.receipt = await this.cmta20.methods.approve(tokenHolder3, 50).send({from: tokenHolder1});
      (await this.cmta20.methods.allowance(tokenHolder1, tokenHolder3).call()).should.equal('50'); 
    }); 
    
    it('emits an Approval event', () => {
      expectEvent(this.receipt.events, 'Approval', { owner: tokenHolder1, spender: tokenHolder3, value: '50'});
    });

    it('reverts when approving when contract is paused', async () => {
      await this.cmta20.methods.pause().send({from: owner});
      await shouldFail.reverting.withMessage(this.cmta20.methods.approve(tokenHolder3, 20).send({from: tokenHolder1}), 'Pausable: paused');
    });
  });

  describe('Transferring', () => {
    beforeEach(async () => {
      await this.setupTestEnvironment();
      await this.cmta20.methods.issue(100).send({from: owner});
      await this.cmta20.methods.transfer(tokenHolder1, 31).send({from: owner});
      await this.cmta20.methods.transfer(tokenHolder2, 32).send({from: owner});
      await this.cmta20.methods.transfer(tokenHolder3, 33).send({from: owner});
    });

    it('can check if transfer is valid', async () => {
      (await this.cmta20.methods.canTransfer(tokenHolder1, tokenHolder2, 11).call()).should.equal(true);
      (await this.cmta20.methods.detectTransferRestriction(tokenHolder1, tokenHolder2, 11).call()).should.equal("0");
      (await this.cmta20.methods.messageForTransferRestriction(0).call()).should.equal("No restriction");
    });

    it('allows tokenHolder1 to transfer tokens to tokenHolder2', async () => {
      await this.cmta20.methods.transfer(tokenHolder2, 11).send({from: tokenHolder1}); 
      (await this.cmta20.methods.balanceOf(owner).call()).should.equal('4');
      (await this.cmta20.methods.balanceOf(tokenHolder1).call()).should.equal('20');
      (await this.cmta20.methods.balanceOf(tokenHolder2).call()).should.equal('43');
      (await this.cmta20.methods.balanceOf(tokenHolder3).call()).should.equal('33');
      (await this.cmta20.methods.totalSupply().call()).should.equal('100');           
    });

    it('reverts if tokenHolder1 transfers more tokens than he owns to tokenHolder2', async () => {
      await shouldFail.reverting(this.cmta20.methods.transfer(tokenHolder2, 50).send({from: tokenHolder1}));        
    });

    it('reverts if tokenHolder1 transfers tokens to tokenHolder2 when paused', async () => {
      await this.cmta20.methods.pause().send({from: owner});
      await shouldFail.reverting.withMessage(this.cmta20.methods.transfer(tokenHolder2, 10).send({from: tokenHolder1}), 'Pausable: paused');     
    });

    it('allows tokenHolder3 to transfer tokens from tokenHolder1 to tokenHolder2 with the right allowance', async () => {
      /* Define allowance */
      await this.cmta20.methods.approve(tokenHolder3, 20).send({from: tokenHolder1});

      /* Transfer */
      await this.cmta20.methods.transferFrom(tokenHolder1, tokenHolder2, 11).send({from: tokenHolder3}); 
      (await this.cmta20.methods.balanceOf(owner).call()).should.equal('4');
      (await this.cmta20.methods.balanceOf(tokenHolder1).call()).should.equal('20');
      (await this.cmta20.methods.balanceOf(tokenHolder2).call()).should.equal('43');
      (await this.cmta20.methods.balanceOf(tokenHolder3).call()).should.equal('33');
      (await this.cmta20.methods.totalSupply().call()).should.equal('100');           
    });

    it('reverts if tokenHolder3 transfers more tokens than the allowance from tokenHolder1 to tokenHolder2', async () => {
      /* Define allowance */
      (await this.cmta20.methods.allowance(tokenHolder1, tokenHolder3).call()).should.equal('0');
      await this.cmta20.methods.approve(tokenHolder3, 20).send({from: tokenHolder1});
      (await this.cmta20.methods.allowance(tokenHolder1, tokenHolder3).call()).should.equal('20');

      /* Transfer */
      await shouldFail.reverting(this.cmta20.methods.transferFrom(tokenHolder1, tokenHolder2, 31).send({from: tokenHolder3}));        
    });

    it('reverts if tokenHolder3 transfers more tokens than tokenHolder1 owns from tokenHolder1 to tokenHolder2', async () => {
      await this.cmta20.methods.approve(tokenHolder3, 1000).send({from: tokenHolder1});
      await shouldFail.reverting(this.cmta20.methods.transferFrom(tokenHolder1, tokenHolder2, 50).send({from: tokenHolder3}));        
    });

    it('reverts if tokenHolder3 transfers tokens from tokenHolder1 to tokenHolder2 when paused', async () => {
      /* Define allowance */
      await this.cmta20.methods.approve(tokenHolder3, 20).send({from: tokenHolder1});

      await this.cmta20.methods.pause().send({from: owner});
      (await this.cmta20.methods.canTransfer(tokenHolder1, tokenHolder2, 10).call()).should.equal(false);
      (await this.cmta20.methods.detectTransferRestriction(tokenHolder1, tokenHolder2, 10).call()).should.equal("1");
      (await this.cmta20.methods.messageForTransferRestriction(1).call()).should.equal("All transfers paused");
      await shouldFail.reverting.withMessage(this.cmta20.methods.transferFrom(tokenHolder1, tokenHolder2, 10).send({from: tokenHolder3}), 'Pausable: paused');     
    });

    describe('Transferring with Rule Engine set', () => {
      beforeEach(async () => {
        await this.cmta20.methods.setRuleEngine(this.ruleEngineMock.options.address).send({from: owner});
      });

      it('can check if transfer is valid', async () => {
        (await this.cmta20.methods.canTransfer(tokenHolder1, tokenHolder2, 11).call()).should.equal(true);
        (await this.cmta20.methods.detectTransferRestriction(tokenHolder1, tokenHolder2, 11).call()).should.equal("0");
        (await this.cmta20.methods.messageForTransferRestriction(0).call()).should.equal("No restriction");
        (await this.cmta20.methods.canTransfer(tokenHolder1, tokenHolder2, 21).call()).should.equal(false);
        (await this.cmta20.methods.detectTransferRestriction(tokenHolder1, tokenHolder2, 21).call()).should.equal("10");
        (await this.cmta20.methods.messageForTransferRestriction(10).call()).should.equal("Amount too high");
      });
  
      it('allows tokenHolder1 to transfer tokens to tokenHolder2', async () => {
        await this.cmta20.methods.transfer(tokenHolder2, 11).send({from: tokenHolder1}); 
        (await this.cmta20.methods.balanceOf(owner).call()).should.equal('4');
        (await this.cmta20.methods.balanceOf(tokenHolder1).call()).should.equal('20');
        (await this.cmta20.methods.balanceOf(tokenHolder2).call()).should.equal('43');
        (await this.cmta20.methods.balanceOf(tokenHolder3).call()).should.equal('33');
        (await this.cmta20.methods.totalSupply().call()).should.equal('100');           
      });
  
      it('reverts if tokenHolder1 transfers more tokens than rule allows', async () => {
        await shouldFail.reverting.withMessage(this.cmta20.methods.transfer(tokenHolder2, 21).send({from: tokenHolder1}), "CM04");        
      });

      it('allows tokenHolder3 to transfer tokens from tokenHolder1 to tokenHolder2 with the right allowance', async () => {
        /* Define allowance */
        await this.cmta20.methods.approve(tokenHolder3, 21).send({from: tokenHolder1});
  
        /* Transfer */
        await this.cmta20.methods.transferFrom(tokenHolder1, tokenHolder2, 11).send({from: tokenHolder3}); 
        (await this.cmta20.methods.balanceOf(owner).call()).should.equal('4');
        (await this.cmta20.methods.balanceOf(tokenHolder1).call()).should.equal('20');
        (await this.cmta20.methods.balanceOf(tokenHolder2).call()).should.equal('43');
        (await this.cmta20.methods.balanceOf(tokenHolder3).call()).should.equal('33');
        (await this.cmta20.methods.totalSupply().call()).should.equal('100');           
      });
  
      it('reverts if tokenHolder3 transfers more tokens than the allowance from tokenHolder1 to tokenHolder2', async () => {
        /* Define allowance */
        (await this.cmta20.methods.allowance(tokenHolder1, tokenHolder3).call()).should.equal('0');
        await this.cmta20.methods.approve(tokenHolder3, 21).send({from: tokenHolder1});
        (await this.cmta20.methods.allowance(tokenHolder1, tokenHolder3).call()).should.equal('21');
  
        /* Transfer */
        await shouldFail.reverting.withMessage(this.cmta20.methods.transferFrom(tokenHolder1, tokenHolder2, 21).send({from: tokenHolder3}), "CM04");        
      });
    });
  });
});

describe('CMTA20', () => {
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
    self.cmta20 = await deployCMTA20FDT(
      buidlerRuntime, { owner, fundsToken: self.fundsToken.options.address },
    );
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
          this.cmta20.methods.mint(anyone, ether('1').toString())
              .send({from: anyone})
        );
      });
    });

    describe('when the contract owner tries to mint tokens', () => {
      describe('when the recipient is the zero address', () => {
        it('reverts', async () => {
          await shouldFail.reverting(
            this.cmta20.methods.mint(ZERO_ADDRESS, ether('1').toString())
                .send({from: owner})
          );
        });
      });

      describe('when the recipient is not the zero address', () => {
        it('mint tokens to the recipient', async () => {
          await this.cmta20.methods.mint(tokenHolder1, ether('1').toString())
              .send({from: owner});

          (await this.cmta20.methods.balanceOf(tokenHolder1).call())
              .should.be.equal(ether('1').toString());
          (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());
          (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());
          (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
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
              .transfer(this.cmta20.options.address, ether('1').toString())
              .send({from: anyone});
          await shouldFail.reverting(
            this.cmta20.methods.updateFundsReceived()
                .send({from: anyone})
          );
        });
      });

      describe('when paying 0 ether', () => {
        it('should succeed but nothing happens', async () => {
          await this.cmta20.methods.mint(tokenHolder1, ether('1').toString())
              .send({from: owner});

          // await this.cmta20.methods.distributeFunds()
          //   .send({from: anyone, value: ether('0').toString()});
          await this.fundsToken.methods
              .transfer(this.cmta20.options.address, ether('0').toString())
              .send({from: anyone});
          await this.cmta20.methods.updateFundsReceived()
              .send({from: anyone});

          (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());
          (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());
          (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());
        });
      });

      describe('when the total supply is not 0', () => {
        it('should pay and distribute funds to token holders', async () => {
          await this.cmta20.methods.mint(tokenHolder1, ether('1').toString())
              .send({from: owner});
          await this.cmta20.methods.mint(tokenHolder2, ether('3').toString())
              .send({from: owner});

          // const { events } = await this.cmta20.sendTransaction()
          //   .send({from: anyone, value: ether('1').toString()});
          // expectEvent(events, 'FundsDistributed', {
          //     from: anyone,
          //     weiAmount: ether('1').toString(),
          //   }
          // );
          await this.fundsToken.methods
              .transfer(this.cmta20.options.address, ether('1').toString())
              .send({from: anyone});
          const { events } = await this.cmta20.methods.updateFundsReceived()
              .send({from: anyone});
          expectEvent(events, 'FundsDistributed', {
            by: anyone,
            fundsDistributed: ether('1').toString(),
          });

          (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0.25').toString());
          (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0.25').toString());
          (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());

          (await this.cmta20.methods.accumulativeFundsOf(tokenHolder2).call())
              .should.be.equal(ether('0.75').toString());
          (await this.cmta20.methods.withdrawableFundsOf(tokenHolder2).call())
              .should.be.equal(ether('0.75').toString());
          (await this.cmta20.methods.withdrawnFundsOf(tokenHolder2).call())
              .should.be.equal(ether('0').toString());
        });
      });
    });

    describe('when anyone tries to pay and distribute funds by sending ether to the contract', () => {
      describe('when the total supply is 0', () => {
        it('reverts', async () => {
          await this.fundsToken.methods
              .transfer(this.cmta20.options.address, ether('1').toString())
              .send({from: anyone});
          await shouldFail.reverting(
            this.cmta20.methods.updateFundsReceived()
                .send({from: anyone})
          );
        });
      });

      describe('when paying 0 ether', () => {
        it('should succeed but nothing happens', async () => {
          await this.cmta20.methods.mint(tokenHolder1, ether('1').toString())
              .send({from: owner});

          // await this.cmta20.sendTransaction()
          //   .send({from: anyone, value: ether('0').toString()});
          await this.fundsToken.methods
              .transfer(this.cmta20.options.address, ether('0').toString())
              .send({from: anyone});
          await this.cmta20.methods.updateFundsReceived()
              .send({from: anyone});

          (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());
          (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());
          (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0').toString());
        });
      });

      describe('when the total supply is not 0', () => {
        it('should pay and distribute funds to token holders', async () => {
          await this.cmta20.methods.mint(tokenHolder1, ether('1').toString())
              .send({from: owner});
          await this.cmta20.methods.mint(tokenHolder2, ether('3').toString())
              .send({from: owner});

          // const { events } = await this.cmta20.sendTransaction()
          //   .send({from: anyone, value: ether('1').toString()});
          // expectEvent(events, 'FundsDistributed', {
          //     from: anyone,
          //     weiAmount: ether('1').toString(),
          //   }
          // );
          await this.fundsToken.methods
              .transfer(this.cmta20.options.address, ether('1').toString())
              .send({from: anyone});
          const { events } = await this.cmta20.methods.updateFundsReceived()
              .send({from: anyone});
          expectEvent(events, 'FundsDistributed', {
            by: anyone,
            fundsDistributed: ether('1').toString(),
          });

          (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
              .should.be.equal(ether('0.25').toString());
          (await this.cmta20.methods.withdrawableFundsOf(tokenHolder2).call())
              .should.be.equal(ether('0.75').toString());
        });
      });
    });
  });

  describe('transfer', () => {
    beforeEach(async () => {
      await this.cmta20.methods.mint(tokenHolder1, ether('1').toString())
          .send({from: owner});
    });

    describe('when the recipient is the zero address', () => {
      it('reverts', async () => {
        await shouldFail.reverting(
          this.cmta20.methods.transfer(ZERO_ADDRESS, ether('0.5').toString())
              .send({from: tokenHolder1})
        );
      });
    });

    describe('when the recipient is not the zero address', () => {
      describe('when the sender does not have enough balance', () => {
        it('reverts', async () => {
          await shouldFail.reverting(
            this.cmta20.methods.transfer(tokenHolder2, ether('2').toString())
                .send({from: tokenHolder1})
          );
        });
      });

      describe('when the sender has enough balance', () => {
        it('transfers the requested amount', async () => {
          await this.cmta20.methods.transfer(tokenHolder2, ether('0.25').toString())
              .send({from: tokenHolder1});

          (await this.cmta20.methods.balanceOf(tokenHolder1).call())
              .should.be.equal(ether('0.75').toString());
          (await this.cmta20.methods.balanceOf(tokenHolder2).call())
              .should.be.equal(ether('0.25').toString());
          });

        it('emits a transfer event', async () => {
          const { events } = await this.cmta20.methods
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
      await this.cmta20.methods.mint(tokenHolder1, mintAmount.toString())
          .send({from: owner});
    });

    describe('when the recipient is not the zero address', () => {
      describe('when the spender has enough approved balance', () => {
        beforeEach(async () => {
          await this.cmta20.methods.approve(spender, approveAmount.toString())
              .send({from: tokenHolder1});
        });

        describe('when the initial holder has enough balance', () => {
          let events;

          beforeEach(async () => {
            const receipt = await this.cmta20.methods
                .transferFrom(tokenHolder1, tokenHolder2, transferAmount.toString())
                .send({from: spender});
            events = receipt.events;
          });

          it('transfers the requested amount', async () => {
            (await this.cmta20.methods.balanceOf(tokenHolder1).call())
                .should.be.equal( mintAmount.sub(transferAmount).toString() );
            (await this.cmta20.methods.balanceOf(tokenHolder2).call())
                .should.be.equal( transferAmount.toString() );
          });

          it('decreases the spender allowance', async () => {
            (await this.cmta20.methods.allowance(tokenHolder1, spender).call())
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
            await this.cmta20.methods.approve(spender, _approveAmount.toString())
                .send({from: tokenHolder1});
          });

          it('reverts', async () => {
            await shouldFail.reverting(this.cmta20.methods
                .transferFrom(tokenHolder1, tokenHolder2, _transferAmount.toString())
                .send({from: spender}));
          });
        });
      });

      describe('when the spender does not have enough approved balance', () => {
        beforeEach(async () => {
          await this.cmta20.methods.approve(spender, approveAmount.toString())
              .send({from: tokenHolder1});
        });

        describe('when the initial holder has enough balance', () => {
          const _transferAmount = approveAmount.addn(1);

          it('reverts', async () => {
            await shouldFail.reverting(this.cmta20.methods
                .transferFrom(tokenHolder1, tokenHolder2, _transferAmount.toString())
                .send({from: spender}));
          });
        });

        describe('when the initial holder does not have enough balance', () => {
          const _transferAmount = mintAmount.addn(1);

          it('reverts', async () => {
            await shouldFail.reverting(this.cmta20.methods
                .transferFrom(tokenHolder1, tokenHolder2, _transferAmount.toString())
                .send({from: spender}));
          });
        });
      });
    });

    describe('when the recipient is the zero address', () => {
      beforeEach(async () => {
        await this.cmta20.methods.approve(spender, approveAmount.toString())
            .send({from: tokenHolder1});
      });

      it('reverts', async () => {
        await shouldFail.reverting(this.cmta20.methods
            .transferFrom(tokenHolder1, ZERO_ADDRESS, transferAmount.toString())
            .send({from: spender}));
      });
    });
  });

  describe('withdrawFunds', () => {
    it('should be able to withdraw funds', async () => {
      await this.cmta20.methods.mint(tokenHolder1, ether('1').toString())
          .send({from: owner});
      await this.cmta20.methods.mint(tokenHolder2, ether('3').toString())
          .send({from: owner});
      // await this.cmta20.methods.distributeFunds()
      //   .send({from: anyone, value: ether('1').toString()});
      await this.fundsToken.methods
          .transfer(this.cmta20.options.address, ether('1').toString())
          .send({from: anyone});
      await this.cmta20.methods.updateFundsReceived()
          .send({from: anyone});

      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());

      // const balance1 = await balance.current(tokenHolder1).call();
      const balance1 = await this.fundsToken.methods.balanceOf(tokenHolder1).call();
      const { events } = await this.cmta20.methods.withdrawFunds()
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

      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());

      // withdraw again. should succeed and withdraw nothing
      // const receipt2 = await this.cmta20.methods.withdrawFunds()
      //   .send({from: tokenHolder1, gasPrice: gasPrice});
      // const balance3 = await balance.current(tokenHolder1);
      const balance3 = await this.fundsToken.methods.balanceOf(tokenHolder1).call();
      // const fee2 = gasPrice.mul(new BN(receipt2.receipt.gasUsed));
      // balance3.should.be.equal( balance2.sub(fee2).toString());
      balance3.should.be.equal(balance2);

      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
    });
  });

  describe('keep funds unchanged in several cases', () => {
    it('should keep funds unchanged after minting tokens', async () => {
      await this.cmta20.methods.mint(tokenHolder1, ether('1').toString(),)
          .send({from: owner});
      await this.cmta20.methods.mint(tokenHolder2, ether('3').toString())
          .send({from: owner});
      // await this.cmta20.methods
      //   .distributeFunds({from: anyone, value: ether('1').toString()})
      //   .send({from: anyone});
      await this.fundsToken.methods
          .transfer(this.cmta20.options.address, ether('1').toString())
          .send({from: anyone});
      await this.cmta20.methods.updateFundsReceived()
          .send({from: anyone});

      await this.cmta20.methods.mint(tokenHolder1, ether('1').toString())
          .send({from: owner});

      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());
    });

    it('should keep funds unchanged after transferring tokens', async () => {
      await this.cmta20.methods.mint(tokenHolder1, ether('1').toString())
          .send({from: owner});
      await this.cmta20.methods.mint(tokenHolder2, ether('3').toString())
          .send({from: owner});
      // await this.cmta20.methods.distributeFunds()
      //   .send({from: anyone, value: ether('1').toString()});
      await this.fundsToken.methods
          .transfer(this.cmta20.options.address, ether('1').toString())
          .send({from: anyone});
      await this.cmta20.methods.updateFundsReceived()
          .send({from: anyone});

      await this.cmta20.methods.transfer(tokenHolder2, ether('1').toString())
          .send({from: tokenHolder1});

      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());

      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0.75').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0.75').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());
    });

    it('should keep funds unchanged after transferFrom', async () => {
      await this.cmta20.methods.mint(tokenHolder1, ether('1').toString())
          .send({from: owner});
      await this.cmta20.methods.mint(tokenHolder2, ether('3').toString())
          .send({from: owner});
      // await this.cmta20.methods
      //   .distributeFunds({from: anyone, value: ether('1').toString()})
      //   .send({from: anyone});
      await this.fundsToken.methods
          .transfer(this.cmta20.options.address, ether('1').toString())
          .send({from: anyone});
      await this.cmta20.methods.updateFundsReceived()
          .send({from: anyone});

      await this.cmta20.methods.approve(tokenHolder3, ether('1').toString())
          .send({from: tokenHolder1});
      await this.cmta20.methods
          .transferFrom(tokenHolder1, tokenHolder2, ether('1').toString())
          .send({from: tokenHolder3});

      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0.25').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());

      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0.75').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0.75').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());
    });

    it('should correctly distribute funds after transferring tokens', async () => {
      await this.cmta20.methods.mint(tokenHolder1, ether('2').toString())
          .send({from: owner});
      await this.cmta20.methods.mint(tokenHolder2, ether('3').toString())
          .send({from: owner});
      // await this.cmta20.methods.distributeFunds()
      //   .send({from: anyone, value: ether('5').toString()});
      await this.fundsToken.methods
          .transfer(this.cmta20.options.address, ether('5').toString())
          .send({from: anyone});
      await this.cmta20.methods.updateFundsReceived()
          .send({from: anyone});

      await this.cmta20.methods.transfer(tokenHolder2, ether('1').toString())
          .send({from: tokenHolder1});
      // await this.cmta20.methods.distributeFunds()
      //   .send({from: anyone, value: ether('50').toString()});
      await this.fundsToken.methods
          .transfer(this.cmta20.options.address, ether('50').toString())
          .send({from: anyone});
      await this.cmta20.methods.updateFundsReceived()
          .send({from: anyone});

      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('12').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('12').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());

      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder2).call())
          .should.be.equal(ether('43').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder2).call())
          .should.be.equal(ether('43').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder2).call())
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
      await this.cmta20.methods.mint(tokenHolder1, ether('2').toString())
          .send({from: owner});
      // await this.cmta20.methods.distributeFunds()
      //   .send({from: anyone, value: ether('10').toString()});
      await this.fundsToken.methods
          .transfer(this.cmta20.options.address, ether('10').toString())
          .send({from: anyone});
      await this.cmta20.methods.updateFundsReceived()
          .send({from: anyone});

      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call()).
      should.be.equal(ether('10').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());

      // transfer
      await this.cmta20.methods.transfer(tokenHolder2, ether('2').toString())
          .send({from: tokenHolder1});
      (await this.cmta20.methods.balanceOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());
      (await this.cmta20.methods.balanceOf(tokenHolder2).call())
          .should.be.equal(ether('2').toString());
      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());
      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());

      // tokenHolder1 withdraw
      // balanceBefore = await balance.current(tokenHolder1).call();
      // receipt = await this.cmta20.methods.withdrawFunds()
      //   .send({from: tokenHolder1, gasPrice: gasPrice});
      // balanceAfter = await balance.current(tokenHolder1).call();
      // fee = gasPrice.mul(new BN(receipt.receipt.gasUsed));
      // balanceAfter.should.be.equal( balanceBefore.add(ether('10').sub(fee).toString());
      balanceBefore = await this.fundsToken.methods.balanceOf(tokenHolder1).call();
      await this.cmta20.methods.withdrawFunds()
          .send({from: tokenHolder1});
      balanceAfter = await this.fundsToken.methods.balanceOf(tokenHolder1).call();
      balanceAfter.should.be.equal((new BN(balanceBefore)).add(ether('10')).toString());

      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());

      // deposit
      // await this.cmta20.methods.distributeFunds()
      //   .send({from: anyone, value: ether('10').toString()});
      await this.fundsToken.methods
          .transfer(this.cmta20.options.address, ether('10').toString())
          .send({from: anyone});
      await this.cmta20.methods.updateFundsReceived()
          .send({from: anyone});
      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());
      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder2).call())
          .should.be.equal(ether('10').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder2).call())
          .should.be.equal(ether('10').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());

      // mint
      await this.cmta20.methods.mint(tokenHolder1, ether('3').toString())
          .send({from: owner});
      (await this.cmta20.methods.balanceOf(tokenHolder1).call())
          .should.be.equal(ether('3').toString());

      // deposit
      // await this.cmta20.methods.distributeFunds()
      //   .send({from: anyone, value: ether('10').toString()});
      await this.fundsToken.methods
          .transfer(this.cmta20.options.address, ether('10').toString())
          .send({from: anyone});
      await this.cmta20.methods.updateFundsReceived()
          .send({from: anyone});
      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('16').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('6').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());
      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder2).call())
          .should.be.equal(ether('14').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder2).call())
          .should.be.equal(ether('14').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());

      // now tokens: 3, 2

      await this.cmta20.methods.transfer(tokenHolder3, ether('2').toString())
          .send({from: tokenHolder2});

      // 3, 0, 2

      await this.cmta20.methods.mint(tokenHolder2, ether('4').toString())
          .send({from: owner});
      await this.cmta20.methods.mint(tokenHolder3, ether('1').toString())
          .send({from: owner});

      // 3 4 3

      await this.cmta20.methods.transfer(tokenHolder1, ether('2').toString())
          .send({from: tokenHolder2});

      // 5 2 3

      await this.cmta20.methods.transfer(tokenHolder3, ether('5').toString())
          .send({from: tokenHolder1});

      // 0 2 8

      await this.cmta20.methods.transfer(tokenHolder2, ether('2').toString())
          .send({from: tokenHolder3});

      // 0 4 6

      await this.cmta20.methods.transfer(tokenHolder1, ether('3').toString())
          .send({from: tokenHolder2});

      // 3, 1, 6

      (await this.cmta20.methods.balanceOf(tokenHolder1).call())
          .should.be.equal(ether('3').toString());
      (await this.cmta20.methods.balanceOf(tokenHolder2).call())
          .should.be.equal(ether('1').toString());
      (await this.cmta20.methods.balanceOf(tokenHolder3).call())
          .should.be.equal(ether('6').toString());

      // deposit
      // await this.cmta20.methods.distributeFunds()
      //   .send({from: anyone, value: ether('10').toString()});
      await this.fundsToken.methods
          .transfer(this.cmta20.options.address, ether('10').toString())
          .send({from: anyone});
      await this.cmta20.methods.updateFundsReceived()
          .send({from: anyone});
      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('19').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('9').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('10').toString());
      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder2).call())
          .should.be.equal(ether('15').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder2).call())
          .should.be.equal(ether('15').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());
      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder3).call())
          .should.be.equal(ether('6').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder3).call())
          .should.be.equal(ether('6').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder3).call())
          .should.be.equal(ether('0').toString());


      // tokenHolder1 withdraw
      // balanceBefore = await balance.current(tokenHolder1);
      // receipt = await this.cmta20.methods.withdrawFunds()
      //   .send({from: tokenHolder1, gasPrice: gasPrice});
      // balanceAfter = await balance.current(tokenHolder1);
      // fee = gasPrice.mul(new BN(receipt.receipt.gasUsed));
      // balanceAfter.should.be.equal( balanceBefore.add(ether('9').sub(fee).toString());
      balanceBefore = await this.fundsToken.methods.balanceOf(tokenHolder1).call();
      await this.cmta20.methods.withdrawFunds()
          .send({from: tokenHolder1});
      balanceAfter = await this.fundsToken.methods.balanceOf(tokenHolder1).call();
      balanceAfter.should.be.equal((new BN(balanceBefore)).add(ether('9')).toString());
      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder1).call())
          .should.be.equal(ether('19').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder1).call())
          .should.be.equal(ether('0').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder1).call())
          .should.be.equal(ether('19').toString());

      // tokenHolder2 withdraw
      // balanceBefore = await balance.current(tokenHolder2);
      // receipt = await this.cmta20.methods.withdrawFunds()
      //   .send({from: tokenHolder2, gasPrice: gasPrice});
      // balanceAfter = await balance.current(tokenHolder2);
      // fee = gasPrice.mul(new BN(receipt.receipt.gasUsed));
      // balanceAfter.should.be.equal( balanceBefore.add(ether('15').sub(fee).toString());
      balanceBefore = await this.fundsToken.methods.balanceOf(tokenHolder2).call();
      await this.cmta20.methods.withdrawFunds()
          .send({from: tokenHolder2});
      balanceAfter = await this.fundsToken.methods.balanceOf(tokenHolder2).call();
      balanceAfter.should.be.equal((new BN(balanceBefore)).add(ether('15')).toString());
      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder2).call())
          .should.be.equal(ether('15').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder2).call())
          .should.be.equal(ether('0').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder2).call())
          .should.be.equal(ether('15').toString());

      // tokenHolder3 withdraw
      // balanceBefore = await balance.current(tokenHolder3);
      // receipt = await this.cmta20.methods.withdrawFunds()
      //   .send({from: tokenHolder3, gasPrice: gasPrice});
      // balanceAfter = await balance.current(tokenHolder3);
      // fee = gasPrice.mul(new BN(receipt.receipt.gasUsed));
      // balanceAfter.should.be.equal( balanceBefore.add(ether('6').sub(fee).toString());
      balanceBefore = await this.fundsToken.methods.balanceOf(tokenHolder3).call();
      await this.cmta20.methods.withdrawFunds()
          .send({from: tokenHolder3});
      balanceAfter = await this.fundsToken.methods.balanceOf(tokenHolder3).call();
      balanceAfter.should.be.equal((new BN(balanceBefore)).add(ether('6')).toString());
      (await this.cmta20.methods.accumulativeFundsOf(tokenHolder3).call())
          .should.be.equal(ether('6').toString());
      (await this.cmta20.methods.withdrawableFundsOf(tokenHolder3).call())
          .should.be.equal(ether('0').toString());
      (await this.cmta20.methods.withdrawnFundsOf(tokenHolder3).call())
          .should.be.equal(ether('6').toString());
    });
  });
});
