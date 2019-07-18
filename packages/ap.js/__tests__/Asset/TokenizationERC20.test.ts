import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import fetch from 'cross-fetch';
import { Contract } from 'web3-eth-contract/types';

// @ts-ignore
import ERC20SampleTokenArtifact from '@atpar/ap-contracts/artifacts/ERC20SampleToken.min.json';

import { AP, Asset } from '../../src';
import { ContractTerms, ContractType, AssetOwnership } from '../../src/types';


describe('TokenizationERC20', () => {

  let web3: Web3;
  let recordCreator: string;
  let counterparty: string;
  
  let contractTemplatesTyped: any;

  let paymentToken: Contract;

  let apRC: AP;
  let apCP: AP;
  let assetRC: Asset;
  let assetCP: Asset;

  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    recordCreator = (await web3.eth.getAccounts())[0];
    counterparty = (await web3.eth.getAccounts())[1];

    const response = await fetch('http://localhost:9000' + '/api/terms', {});
    const contractTemplates = await response.json();
    contractTemplatesTyped = {};

    (<any>Object).keys(contractTemplates).map((key: string) => {
      const typedContractTerms = (<ContractTerms>(<any>contractTemplates)[key]);
      typedContractTerms.contractType = ContractType.PAM;
      (<any>contractTemplatesTyped)[key] = typedContractTerms;
    });

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

    const terms = (<any>contractTemplatesTyped)['10001'];
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

  it('should deploy new ClaimsToken contract and set it as the recordCreatorBeneficiary', async () => {
    const claimsTokenAddress = await assetRC.tokenizeBeneficiary();
    const totalSupply = await apRC.tokenization.getTotalTokenSupply(claimsTokenAddress);
    const balance = await apRC.tokenization.getTokenBalance(claimsTokenAddress, apRC.signer.account);

    expect(totalSupply.isGreaterThan(0)).toBe(true);
    expect(totalSupply.isEqualTo(balance)).toBe(true);
  });

  it('should return the correct amount of available funds', async () => {
    const state = await assetCP.getState();
    const timestamp = Number(state.lastEventTime) + 5256000;
    const amountOutstandingForObligation = await assetCP.getAmountOutstandingForNextObligation(timestamp);
    const { recordCreatorBeneficiary } = await assetRC.getOwnership(); 

    await paymentToken.methods.approve(
      apCP.contracts.paymentRouter.getAddress(), 
      amountOutstandingForObligation.abs().toFixed()
    ).send({ from: counterparty });

    await assetCP.settleNextObligation(
      timestamp, 
      amountOutstandingForObligation.abs()
    );

    await apRC.tokenization.updateFundsReceived(
      recordCreatorBeneficiary
    ).send({ from: recordCreator });

    const balance = await apRC.tokenization.getAvailableFunds(
      recordCreatorBeneficiary, 
      recordCreator
    );

    expect(balance.isGreaterThan(0)).toBe(true);
    expect(balance.isEqualTo(amountOutstandingForObligation)).toBe(true);
  });

  it('should withdraw available funds', async () => {
    const { recordCreatorBeneficiary } = await assetRC.getOwnership(); 
    const availableFunds = await apRC.tokenization.getAvailableFunds(
      recordCreatorBeneficiary, recordCreator
    );
    const preBalance = await paymentToken.methods.balanceOf(recordCreatorBeneficiary).call();

    await apRC.tokenization.withdrawFunds(recordCreatorBeneficiary).send(
      { from: recordCreator, gas: 100000 }
    );

    const postBalance = await paymentToken.methods.balanceOf(recordCreatorBeneficiary).call();
    expect(availableFunds.plus(postBalance).isEqualTo(preBalance));
  });

  it('should transfer ClaimsTokens', async () => {
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
