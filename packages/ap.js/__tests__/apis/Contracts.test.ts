import Web3 from 'web3';

// @ts-ignore
import Deployments from '@atpar/ap-contracts/deployments.json';

import { Contracts } from '../../src/apis';
import { AddressBook } from '../../src/types';


describe('Contracts', () => {

  let web3: Web3;
  let contracts: Contracts;
  let addressBook: AddressBook;


  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

    // @ts-ignore
    addressBook = Deployments[await web3.eth.net.getId()];
  });

  it('should instantiate ContractsAPI', async () => {
    contracts = new Contracts(web3, addressBook);

    const initializedAddresses = {
      ANNEngine: contracts.annEngine.options.address,
      AssetActor: contracts.assetActor.options.address,
      AssetIssuer: contracts.assetIssuer.options.address,
      AssetRegistry: contracts.assetRegistry.options.address,
      CEGEngine: contracts.cegEngine.options.address,
      CECEngine: contracts.cecEngine.options.address,
      Custodian: contracts.custodian.options.address,
      MarketObjectRegistry: contracts.marketObjectRegistry.options.address,
      PAMEngine: contracts.pamEngine.options.address,
      ProductRegistry: contracts.productRegistry.options.address,
      SignedMath: contracts.signedMath.options.address,
      TokenizationFactory: contracts.tokenizationFactory.options.address
    }

    expect(contracts instanceof Contracts).toBe(true);
    expect(initializedAddresses).toEqual(addressBook);
  });

  it('should return instance of IEngine for a given address', async () => {
    expect(
      contracts.engine('0x0000000000000000000000000000000000000001').options.address === '0x0000000000000000000000000000000000000001'
    ).toBe(true);    
  });

  it('should return instance of FDT_ERC20Extension for a given address', async () => {
    expect(
      contracts.distributor('0x0000000000000000000000000000000000000001').options.address === '0x0000000000000000000000000000000000000001'
    ).toBe(true);
  });

  it('should return instance of ERC20 for a given address', async () => {
    expect(
      contracts.erc20('0x0000000000000000000000000000000000000001').options.address === '0x0000000000000000000000000000000000000001'
    ).toBe(true);
  });
});
