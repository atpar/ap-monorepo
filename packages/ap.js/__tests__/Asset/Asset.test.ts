import Web3 from 'web3';

import { AP, Asset } from '../../src';
import { ContractTerms, ContractType, AssetOwnership } from '../../src/types';


describe('AssetClass', () => {

  let web3: Web3;
  let recordCreator: string;
  let counterparty: string;
  
  let contractTemplatesTyped: any;

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

    apRC = await AP.init(web3, recordCreator);
    apCP = await AP.init(web3, counterparty);
  });

  it('should create a new Asset instance', async () => {
    const terms = (<any>contractTemplatesTyped)['10001'];

    const ownership: AssetOwnership = { 
      recordCreatorObligor: recordCreator,
      recordCreatorBeneficiary: recordCreator,
      counterpartyObligor: counterparty, 
      counterpartyBeneficiary: counterparty
    }

    assetRC = await Asset.create(apRC, terms, ownership);

    const storedOwnership = await apRC.ownership.getOwnership(assetRC.assetId);
    const storedTerms = await assetRC.getTerms();
    
    expect(assetRC instanceof Asset).toBe(true);
    expect(ownership).toStrictEqual(storedOwnership);
    expect(terms.statusDate.toString() === storedTerms.statusDate.toString()).toBe(true);
  });

  it('should load Asset from registries for counterparty', async () => {
    assetCP = await Asset.load(apCP, assetRC.assetId);

    const storedOwnershipRC = await apRC.ownership.getOwnership(assetRC.assetId);
    const storedTermsRC = await assetRC.getTerms();
    const storedOwnershipCP = await apCP.ownership.getOwnership(assetCP.assetId);
    const storedTermsCP = await assetCP.getTerms();

    expect(assetCP instanceof Asset).toBe(true);
    expect(storedOwnershipCP).toStrictEqual(storedOwnershipRC);
    expect(storedTermsCP.statusDate === storedTermsRC.statusDate).toBe(true);
  });
});
