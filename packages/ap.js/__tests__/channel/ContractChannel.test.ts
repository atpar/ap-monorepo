import Web3 from 'web3';

import { AP, ContractChannel } from '../../src';
import { ContractTerms, ContractType } from '../../src/types';

describe('testContractChannelClass', () => {

  let web3: Web3;
  let recordCreator: string;
  let counterparty: string;

  let response: Response;
  let contractTemplates: any;
  let contractTemplatesTyped: any;

  let apRC: AP;
  let apCP: AP;

  let contractChannel: ContractChannel;

  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

    recordCreator = (await web3.eth.getAccounts())[0];
    counterparty = (await web3.eth.getAccounts())[1];

    response = await fetch('http://localhost:9000' + '/api/terms?precision=' + 18, {});
    contractTemplates = await response.json();
    contractTemplatesTyped = {};

    (<any>Object).keys(contractTemplates).map((key: string) => {
      const typedContractTerms: ContractTerms = (<ContractTerms>(<any>contractTemplates)[key]);
      typedContractTerms.contractType = ContractType.PAM;
      (<any>contractTemplatesTyped)[key] = typedContractTerms;
    });

    apRC = await AP.init(web3, recordCreator, 'http://localhost:9000');
    apCP = await AP.init(web3, counterparty, 'http://localhost:9000');

    const terms = (<any>contractTemplatesTyped)['10001'];
    const ownership = {
      recordCreatorObligorAddress: recordCreator, 
      recordCreatorBeneficiaryAddress: recordCreator, 
      counterpartyObligorAddress: counterparty,
      counterpartyBeneficiaryAddress: counterparty
    };

    contractChannel = await ContractChannel.create(apRC, terms, ownership);
  });

  it('should instantiate channel from valid signed contract update', async () => {
    const initialSignedContractUpdate = contractChannel.getLastSignedContractUpdate();
    const contractChannel2 = await ContractChannel.fromSignedContractUpdate(apRC, initialSignedContractUpdate);
    expect(contractChannel2 instanceof ContractChannel).toBe(true);
  });

  it('should not instantiate channel from invalid signed contract update', async () => {
    const lastSignedContractUpdate = contractChannel.getLastSignedContractUpdate();
    lastSignedContractUpdate.contractUpdate.contractId = '03';

    await expect(
      ContractChannel.fromSignedContractUpdate(apRC, lastSignedContractUpdate)
    ).rejects.toThrow('EXECUTION_ERROR: invalid signed contract update provided.');
  });

  it('should receive at least one new contract on behalf of the counterparty', async () => {
    const mockCallback = jest.fn(() => {});

    apCP.onNewContractChannel(mockCallback);

    await new Promise(resolve => setTimeout(resolve, 3000));

    expect(mockCallback.mock.calls.length).toBe(1);    
  });
});
