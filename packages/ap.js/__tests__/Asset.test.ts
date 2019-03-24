import Web3 from 'web3';

import { AP, Asset } from '../src';
import { ContractTerms, ContractType, AssetOwnership } from '../src/types';

describe('testContractClass', () => {

  let web3: Web3;
  let recordCreator: string;
  let contractTemplatesTyped: any;

  let ap: AP;
  let asset: Asset;

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

    ap = await AP.init(web3, recordCreator, {});
  });

  it('should create a new contract instance', async () => {
    const terms: ContractTerms = (<any>contractTemplatesTyped)['10001'];

    const ownership: AssetOwnership = { 
      recordCreatorObligorAddress: recordCreator,
      recordCreatorBeneficiaryAddress: recordCreator,
      counterpartyObligorAddress: '0xb1495069F8d780B0C4123E96b0B6bb0217048C09', 
      counterpartyBeneficiaryAddress: '0xb1495069F8d780B0C4123E96b0B6bb0217048C09'
    }

    asset = await Asset.create(
      ap,
      terms, 
      ownership
    );

    const storedOwnership: AssetOwnership = await ap.ownership.getOwnership(asset.assetId);
    const storedTerms: ContractTerms = await asset.getTerms();
    
    expect(asset instanceof Asset).toBe(true);
    expect(ownership.toString() === storedOwnership.toString()).toBe(true);
    expect(terms.statusDate === storedTerms.statusDate);
  });

  // it('should', async () => {
  //   const eventSchedule = await contract.getExpectedSchedule();
  //   // console.log(eventSchedule);
  // });
});
