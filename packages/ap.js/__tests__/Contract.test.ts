import Web3 from 'web3';

import { AP, Contract } from '../src';
import { ContractTerms, ContractType, ContractOwnership } from '../src/types';

describe('testContractClass', () => {

  let web3: Web3;
  let recordCreator: string;
  let contractTemplatesTyped: any;

  let ap: AP;
  let contract: Contract;

  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    recordCreator = (await web3.eth.getAccounts())[0];

    const response = await fetch('http://localhost:9000' + '/api/terms?precision=' + 18, {});
    const contractTemplates = await response.json();
    contractTemplatesTyped = {};

    (<any>Object).keys(contractTemplates).map((key: string) => {
      const typedContractTerms: ContractTerms = (<ContractTerms>(<any>contractTemplates)[key]);
      typedContractTerms.contractType = ContractType.PAM;
      (<any>contractTemplatesTyped)[key] = typedContractTerms;
    });

    ap = await AP.init(web3, recordCreator, 'http://localhost:9000');
  });

  it('should create a new contract instance', async () => {
    const terms: ContractTerms = (<any>contractTemplatesTyped)['10001'];

    const ownership: ContractOwnership = { 
      recordCreatorObligorAddress: recordCreator,
      recordCreatorBeneficiaryAddress: recordCreator,
      counterpartyObligorAddress: '0xb1495069F8d780B0C4123E96b0B6bb0217048C09', 
      counterpartyBeneficiaryAddress: '0xb1495069F8d780B0C4123E96b0B6bb0217048C09'
    }

    contract = await Contract.create(
      ap, 
      terms, 
      ownership
    );

    const storedOwnership: ContractOwnership = await ap.ownership.getContractOwnership(contract.contractId);
    const storedTerms: ContractTerms = await contract.getContractTerms();
    
    expect(contract instanceof Contract).toBe(true);
    expect(ownership.toString() === storedOwnership.toString()).toBe(true);
    expect(terms.statusDate === storedTerms.statusDate);
  });

  // it('should', async () => {
  //   console.log(await contract.contractEngine.computeNextState(1362096000));
  // });
});
