import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract/types';

import { AP, Asset } from '../../src';
import { AssetOwnership, ContractTerms } from '../../src/types';

// @ts-ignore
import ERC20SampleTokenArtifact from '@atpar/ap-contracts/artifacts/ERC20SampleToken.min.json';
// @ts-ignore
import DefaultTerms from '../DefaultTerms.json';


describe('TokenizationERC20', () => {

  let web3: Web3;
  let recordCreator: string;
  let counterparty: string;

  let paymentToken: Contract;

  let apRC: AP;
  let apCP: AP;
  let assetRC: Asset;
  let assetCP: Asset;

  const dustDeviation = 1;

  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    recordCreator = (await web3.eth.getAccounts())[0];
    counterparty = (await web3.eth.getAccounts())[1];

    paymentToken = new web3.eth.Contract(
      // @ts-ignore
      ERC20SampleTokenArtifact.abi,
    );
    // @ts-ignore
    await paymentToken.deploy({ data: ERC20SampleTokenArtifact.bytecode }).send(
      { from: counterparty, gas: 2000000 }
    );

    apRC = await AP.init(web3, recordCreator);
    apCP = await AP.init(web3, counterparty);

    const terms: ContractTerms = DefaultTerms;
    terms.currency = paymentToken.options.address;

    const ownership: AssetOwnership = { 
      recordCreatorObligor: recordCreator,
      recordCreatorBeneficiary: recordCreator,
      counterpartyObligor: counterparty, 
      counterpartyBeneficiary: counterparty
    }

    assetRC = await Asset.create(apRC, terms, ownership);
    assetCP = await Asset.load(apCP, assetRC.assetId);
  });

  it('should tokenize recordCreatorBeneficiary', async () => {
    const fdtAddress = await assetRC.tokenizeBeneficiary(
      'FundsDistributionToken',
      'FDT',
      new BigNumber("10000000000000000000000")
    );
    const totalSupply = await apRC.tokenization.getTotalTokenSupply(fdtAddress);
    const balance = await apRC.tokenization.getTokenBalance(fdtAddress, apRC.signer.account);

    expect(totalSupply.isGreaterThan(0)).toBe(true);
    expect(totalSupply.isEqualTo(balance)).toBe(true);
  });

  it('should return the correct amount of withdrawable funds', async () => {
    const state = await assetCP.getState();
    const timestamp = Number(state.lastEventTime) + 5256000;
    const amountOutstandingForObligation = await assetCP.getAmountOutstandingForNextObligation(timestamp);
    const { recordCreatorBeneficiary } = await assetRC.getOwnership(); 

    await paymentToken.methods.approve(
      apCP.contracts.paymentRouter.instance.options.address, 
      amountOutstandingForObligation.abs().toFixed()
    ).send({ from: counterparty });

    await assetCP.settleNextObligation(
      timestamp, 
      amountOutstandingForObligation.abs()
    );

    await apRC.tokenization.updateFundsReceived(
      recordCreatorBeneficiary
    ).send({ from: recordCreator });

    const balance = await apRC.tokenization.getWithdrawableFunds(
      recordCreatorBeneficiary, 
      recordCreator
    );

    expect(balance.isGreaterThan(0)).toBe(true);
    expect(balance.isEqualTo(amountOutstandingForObligation.minus(dustDeviation))).toBe(true);
  });

  it('should withdraw withdrawable funds', async () => {
    const { recordCreatorBeneficiary } = await assetRC.getOwnership(); 
    const availableFunds = await apRC.tokenization.getWithdrawableFunds(
      recordCreatorBeneficiary, recordCreator
    );
    const preBalance = await paymentToken.methods.balanceOf(recordCreatorBeneficiary).call();

    await apRC.tokenization.withdrawFunds(recordCreatorBeneficiary).send(
      { from: recordCreator, gas: 100000 }
    );

    const postBalance = await paymentToken.methods.balanceOf(recordCreatorBeneficiary).call();
    expect(availableFunds.plus(postBalance).isEqualTo(preBalance));
  });

  it('should transfer FD-Tokens', async () => {
    const { recordCreatorBeneficiary } = await assetRC.getOwnership(); 
    const value = new BigNumber(1000);

    await apRC.tokenization.transferTokens(recordCreatorBeneficiary, counterparty, value).send(
      { from: recordCreator, gas: 100000 }
    );

    const balance = await apRC.tokenization.getTokenBalance(
      recordCreatorBeneficiary, 
      counterparty
    );
    
    expect(balance.isEqualTo(value)).toBe(true);
  });
});
