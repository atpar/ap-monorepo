import Web3 from 'web3';

import { AP, Asset } from '../../src';
import { AssetOwnership, ContractTerms } from '../../src/types';

// @ts-ignore
import DefaultTerms from '../DefaultTerms.json';


describe('AssetClass', () => {

  let web3: Web3;
  let recordCreator: string;
  let counterparty: string;

  let apRC: AP;
  let apCP: AP;
  let assetRC: Asset;
  let assetCP: Asset;

  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    recordCreator = (await web3.eth.getAccounts())[0];
    counterparty = (await web3.eth.getAccounts())[1];

    apRC = await AP.init(web3, recordCreator);
    apCP = await AP.init(web3, counterparty);
  });

  it('should create a new Asset instance', async () => {
    const terms: ContractTerms = DefaultTerms;

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
