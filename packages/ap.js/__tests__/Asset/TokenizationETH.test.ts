import Web3 from 'web3';
import BigNumber from 'bignumber.js';

import { AP, Asset } from '../../src';
import { AssetOwnership, ContractTerms } from '../../src/types';

// @ts-ignore
import DefaultTerms from '../DefaultTerms.json';


describe('TokenizationETH', () => {

  let web3: Web3;
  let recordCreator: string;
  let counterparty: string;

  let apRC: AP;
  let apCP: AP;
  let assetRC: Asset;
  let assetCP: Asset;

  const dustDeviation = 1;

  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    recordCreator = (await web3.eth.getAccounts())[0];
    counterparty = (await web3.eth.getAccounts())[1];

    apRC = await AP.init(web3, recordCreator);
    apCP = await AP.init(web3, counterparty);

    const terms: ContractTerms = DefaultTerms;

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
      new BigNumber("1000000000000000000000")
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

    await assetCP.settleNextObligation(
      timestamp, 
      amountOutstandingForObligation.abs()
    );

    const { recordCreatorBeneficiary } = await assetRC.getOwnership(); 

    const balance = await apRC.tokenization.getWithdrawableFunds(
      recordCreatorBeneficiary, 
      recordCreator
    );

    expect(balance.isGreaterThan(0)).toBe(true);
    expect(balance.isEqualTo(amountOutstandingForObligation.minus(dustDeviation))).toBe(true);
  });

  it('should withdraw available funds', async () => {
    const { recordCreatorBeneficiary } = await assetRC.getOwnership(); 
    const withdrawableFunds = await apRC.tokenization.getWithdrawableFunds(
      recordCreatorBeneficiary, recordCreator
    );
    const preBalance = await web3.eth.getBalance(recordCreatorBeneficiary);

    await apRC.tokenization.withdrawFunds(recordCreatorBeneficiary).send(
      { from: recordCreator, gas: 100000 }
    );

    const postBalance = await web3.eth.getBalance(recordCreatorBeneficiary);
    expect(withdrawableFunds.plus(postBalance).isEqualTo(preBalance));
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
