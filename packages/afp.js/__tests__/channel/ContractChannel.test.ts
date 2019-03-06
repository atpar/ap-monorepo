import Web3 from 'web3';

import { AFP } from '../../src';
import { ContractTerms, ContractType } from '../../src/types';
import { ContractChannel } from '../../src/channel/ContractChannel';

describe('testContractChannelClass', () => {

  let web3: Web3;
  let recordCreator: string;
  let counterparty: string;

  let response: Response;
  let contractTemplates: any;
  let contractTemplatesTyped: any;

  let afpRC: AFP;
  let afpCP: AFP;

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

    afpRC = await AFP.init(web3, recordCreator, 'http://localhost:9000');
    afpCP = await AFP.init(web3, counterparty, 'http://localhost:9000');

    const contractId = 'PAM' + String(Math.floor(Date.now() / 1000));
    const contractTerms = (<any>contractTemplatesTyped)['10001'];
    const contractOwnership = {
      recordCreatorObligorAddress: recordCreator, 
      recordCreatorBeneficiaryAddress: recordCreator, 
      counterpartyObligorAddress: counterparty,
      counterpartyBeneficiaryAddress: counterparty
    };

    contractChannel = await ContractChannel.create(afpRC, contractTerms);

    await contractChannel.signAndSendInitialContractUpdate(
      contractId,
      contractOwnership
    );
  });

  it('should instantiate channel from valid signed contract update', async () => {
    const initialSignedContractUpdate = contractChannel.getLastSignedContractUpdate();
    const contractChannel2 = await ContractChannel.fromSignedContractUpdate(afpRC, initialSignedContractUpdate);
    expect(contractChannel2 instanceof ContractChannel).toBe(true);
  });

  it('should not instantiate channel from invalid signed contract update', async () => {
    const lastSignedContractUpdate = contractChannel.getLastSignedContractUpdate();
    lastSignedContractUpdate.contractUpdate.contractId = '03';

    await expect(
      ContractChannel.fromSignedContractUpdate(afpRC, lastSignedContractUpdate)
    ).rejects.toThrow('EXECUTION_ERROR: invalid signed contract update provided.');
  });

  it('should receive at least one new contract on behalf of the counterparty', async () => {
    const mockCallback = jest.fn(() => {});

    afpCP.onNewContractChannel(mockCallback);

    await new Promise(resolve => setTimeout(resolve, 3000));

    expect(mockCallback.mock.calls.length).toBe(1);    
  });
});
