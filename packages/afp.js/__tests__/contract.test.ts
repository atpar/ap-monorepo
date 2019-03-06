import Web3 from 'web3';

import { AFP, Contract } from '../src';
import { ContractTerms, ContractType } from '../src/types';

describe('testContractClass', () => {

  let web3: Web3;
  let recordCreator: string;

  let response: Response;
  let contractTemplates: any;
  let contractTemplatesTyped: any;
  let afp: AFP;

  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    recordCreator = (await web3.eth.getAccounts())[0];

    response = await fetch('http://localhost:9000' + '/api/terms?precision=' + 18, {});
    contractTemplates = await response.json();
    contractTemplatesTyped = {};

    (<any>Object).keys(contractTemplates).map((key: string) => {
      const typedContractTerms: ContractTerms = (<ContractTerms>(<any>contractTemplates)[key]);
      typedContractTerms.contractType = ContractType.PAM;
      (<any>contractTemplatesTyped)[key] = typedContractTerms;
    });

    afp = await AFP.init(web3, recordCreator, 'http://localhost:9000');
  });

  it('should create a new contract instance', async () => {

    const account = (await web3.eth.getAccounts())[0];

    const contractOwnership = { 
      recordCreatorObligorAddress: account,
      recordCreatorBeneficiaryAddress: account,
      counterpartyObligorAddress: '0xb1495069F8d780B0C4123E96b0B6bb0217048C09', 
      counterpartyBeneficiaryAddress: '0xb1495069F8d780B0C4123E96b0B6bb0217048C09'
    }

    const contract = await Contract.create(
      afp, 
      (<any>contractTemplatesTyped)['10001'], 
      contractOwnership,
      { from: recordCreator, gas: 6000000 }
    );

    expect(contract instanceof Contract).toBe(true);
  });
});
