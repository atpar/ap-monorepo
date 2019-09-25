import Web3 from 'web3';

import { ContractsAPI } from '../../src/apis';
import { IEngine } from '../../src/wrappers';
import { ContractType } from '../../src/types';

// @ts-ignore
import Deployments from '@atpar/ap-contracts/deployments.json';


describe('ContractsAPI', () => {

  let web3: Web3;
  let contractsAPI: ContractsAPI;


  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    contractsAPI = await ContractsAPI.init(web3);
  });

  it('should instantiate ContractsAPI', async () => {
    // @ts-ignore
    const addressBook = Deployments[await web3.eth.net.getId()];

    const contractsAPI = await ContractsAPI.init(web3);

    expect(contractsAPI instanceof ContractsAPI).toBe(true);

    const initializedAddresses = {
      ANNEngine: contractsAPI.annEngine.instance.options.address,
      AssetActor: contractsAPI.assetActor.instance.options.address,
      AssetIssuer: contractsAPI.assetIssuer.instance.options.address,
      AssetRegistry: contractsAPI.assetRegistry.instance.options.address,
      PAMEngine: contractsAPI.pamEngine.instance.options.address,
      PaymentRegistry: contractsAPI.paymentRegistry.instance.options.address,
      PaymentRouter: contractsAPI.paymentRouter.instance.options.address,
      SignedMath: addressBook.SignedMath,
      TokenizationFactory: contractsAPI.tokenizationFactory.instance.options.address
    }

    expect(initializedAddresses).toEqual(addressBook);
  });

  it('should instantiate ContractsAPI with a custom addressbook', async () => {
    const customAddressBook = Deployments[5];

    const contractsAPI = await ContractsAPI.init(web3, customAddressBook);

    expect(contractsAPI instanceof ContractsAPI).toBe(true);

    const initializedAddresses = {
      ANNEngine: contractsAPI.annEngine.instance.options.address,
      AssetActor: contractsAPI.assetActor.instance.options.address,
      AssetIssuer: contractsAPI.assetIssuer.instance.options.address,
      AssetRegistry: contractsAPI.assetRegistry.instance.options.address,
      PAMEngine: contractsAPI.pamEngine.instance.options.address,
      PaymentRegistry: contractsAPI.paymentRegistry.instance.options.address,
      PaymentRouter: contractsAPI.paymentRouter.instance.options.address,
      SignedMath: customAddressBook.SignedMath,
      TokenizationFactory: contractsAPI.tokenizationFactory.instance.options.address
    }

    expect(initializedAddresses).toEqual(customAddressBook);
  });

  it('should return instance of IEngine for a given contract type or address', async () => {
    expect(
      contractsAPI.engineContract(ContractType.PAM) instanceof IEngine
    ).toBe(true);

    expect(
      contractsAPI.engineContract(contractsAPI.pamEngine.instance.options.address) instanceof IEngine
    ).toBe(true);
  });
});
