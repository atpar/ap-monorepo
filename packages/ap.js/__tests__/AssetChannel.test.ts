import Web3 from 'web3';

import { AP, AssetChannel } from '../src';
import { ContractTerms, ContractType } from '../src/types';

describe('AssetChannelClass', () => {

  let web3: Web3;
  let recordCreator: string;
  let counterparty: string;

  let response: Response;
  let contractTemplates: any;
  let contractTemplatesTyped: any;

  let apRC: AP;
  let apCP: AP;

  let assetChannel: AssetChannel;

  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

    recordCreator = (await web3.eth.getAccounts())[0];
    counterparty = (await web3.eth.getAccounts())[1];

    response = await fetch('http://localhost:9000' + '/api/terms', {});
    contractTemplates = await response.json();
    contractTemplatesTyped = {};

    (<any>Object).keys(contractTemplates).map((key: string) => {
      const typedContractTerms: ContractTerms = (<ContractTerms>(<any>contractTemplates)[key]);
      typedContractTerms.contractType = ContractType.PAM;
      (<any>contractTemplatesTyped)[key] = typedContractTerms;
    });

    apRC = await AP.init(web3, recordCreator, { channelRelayer: 'http://localhost:9000' });
    apCP = await AP.init(web3, counterparty, { channelRelayer: 'http://localhost:9000' });

    const terms = (<any>contractTemplatesTyped)['10001'];
    const ownership = {
      recordCreatorObligor: recordCreator, 
      recordCreatorBeneficiary: recordCreator, 
      counterpartyObligor: counterparty,
      counterpartyBeneficiary: counterparty
    };

    assetChannel = await AssetChannel.create(apRC, terms, ownership);
  });

  it('should instantiate channel from valid signed contract update', async () => {
    const initialSignedContractUpdate = assetChannel.getLastSignedContractUpdate();
    const assetChannel2 = await AssetChannel.fromSignedContractUpdate(apRC, initialSignedContractUpdate);
    expect(assetChannel2 instanceof AssetChannel).toBe(true);
  });

  it('should not instantiate channel from invalid signed contract update', async () => {
    const lastSignedContractUpdate = assetChannel.getLastSignedContractUpdate();
    lastSignedContractUpdate.contractUpdate.assetId = '03';

    await expect(
      AssetChannel.fromSignedContractUpdate(apRC, lastSignedContractUpdate)
    ).rejects.toThrow('EXECUTION_ERROR: invalid signed contract update provided.');
  });

  it('should receive at least one new asset on behalf of the counterparty', async () => {
    const mockCallback = jest.fn(() => {});

    apCP.onNewAssetChannel(mockCallback);

    await new Promise(resolve => setTimeout(resolve, 2500)); // poll frequency set to 2s

    expect(mockCallback.mock.calls.length).toBe(1);    
  });
});
