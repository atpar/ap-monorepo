import Web3 from 'web3';

// @ts-ignore
import ADDRESS_BOOK from '../../ap-chain/addresses.json';

import { Contracts } from '../../src/apis';
import { AddressBook } from '../../src/types';


describe('Contracts', (): void => {

  let web3: Web3;
  let contracts: Contracts;
  let addressBook: AddressBook;


  beforeAll(async (): Promise<void> => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

    // @ts-ignore
    addressBook = ADDRESS_BOOK;
  });

  it('should instantiate ContractsAPI', async (): Promise<void> => {
    contracts = new Contracts(web3, addressBook);

    const initializedAddresses = {
      ANNActor: contracts.annActor.options.address,
      ANNEngine: contracts.annEngine.options.address,
      ANNRegistry: contracts.annRegistry.options.address,
      CECActor: contracts.cecActor.options.address,
      CECEngine: contracts.cecEngine.options.address,
      CECRegistry: contracts.cecRegistry.options.address,
      CEGActor: contracts.cegActor.options.address,
      CEGEngine: contracts.cegEngine.options.address,
      CEGRegistry: contracts.cegRegistry.options.address,
      CERTFActor: contracts.certfActor.options.address,
      CERTFEngine: contracts.certfEngine.options.address,
      CERTFRegistry: contracts.certfRegistry.options.address,
      COLLAActor: contracts.collaActor.options.address,
      COLLAEngine: contracts.collaEngine.options.address,
      COLLARegistry: contracts.collaRegistry.options.address,
      Custodian: contracts.custodian.options.address,
      DataRegistryProxy: contracts.dataRegistryProxy.options.address,
      PAMActor: contracts.pamActor.options.address,
      PAMEngine: contracts.pamEngine.options.address,
      PAMRegistry: contracts.pamRegistry.options.address,
      STKActor: contracts.stkActor.options.address,
      STKEngine: contracts.stkEngine.options.address,
      STKRegistry: contracts.stkRegistry.options.address,
      DvPSettlement: contracts.dvpSettlement.options.address,
    }

    expect(contracts instanceof Contracts).toBe(true);
    expect(initializedAddresses).toEqual(addressBook);
  });

  it('should return instance of an Engine contract', async (): Promise<void> => {
    expect(
      contracts.engine('0').options.address === contracts.pamEngine.options.address
    ).toBe(true);
    expect(
      contracts.engine('0', '0x0000000000000000000000000000000000000002').options.address === '0x0000000000000000000000000000000000000002'
    ).toBe(true);
  });

  it('should return instance of an AssetActor contract', async (): Promise<void> => {
    expect(
      contracts.assetActor('0').options.address === contracts.pamActor.options.address
    ).toBe(true);
    expect(
      contracts.assetActor(null, '0x0000000000000000000000000000000000000001').options.address === '0x0000000000000000000000000000000000000001'
    ).toBe(true);
    expect(
      contracts.assetActor('0', '0x0000000000000000000000000000000000000002').options.address === '0x0000000000000000000000000000000000000002'
    ).toBe(true);
  });

  it('should return instance of an AssetRegistry contract', async (): Promise<void> => {
    expect(
      contracts.assetRegistry('0').options.address === contracts.pamRegistry.options.address
    ).toBe(true);
    expect(
      contracts.assetRegistry(null, '0x0000000000000000000000000000000000000001').options.address === '0x0000000000000000000000000000000000000001'
    ).toBe(true);
    expect(
      contracts.assetRegistry('0', '0x0000000000000000000000000000000000000002').options.address === '0x0000000000000000000000000000000000000002'
    ).toBe(true);
  });

  it('should return instance of ERC2222 for a given address', async (): Promise<void> => {
    expect(
      contracts.erc2222('0x0000000000000000000000000000000000000001').options.address === '0x0000000000000000000000000000000000000001'
    ).toBe(true);
  });

  it('should return instance of ERC20 for a given address', async (): Promise<void> => {
    expect(
      contracts.erc20('0x0000000000000000000000000000000000000001').options.address === '0x0000000000000000000000000000000000000001'
    ).toBe(true);
  });
});
