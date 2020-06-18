import Web3 from 'web3';

// @ts-ignore
import Deployments from '@atpar/ap-contracts/deployments.json';

import { Contracts } from '../../src/apis';
import { AddressBook } from '../../src/types';


describe('Contracts', (): void => {

  let web3: Web3;
  let contracts: Contracts;
  let addressBook: AddressBook;


  beforeAll(async (): Promise<void> => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

    // @ts-ignore
    addressBook = Deployments[await web3.eth.net.getId()];
  });

  it('should instantiate ContractsAPI', async (): Promise<void> => {
    contracts = new Contracts(web3, addressBook);

    // const initializedAddresses = {
    //   ANNActor: contracts.annActor.options.address,
    //   // ANNEncoder: contracts.annEncoder.options.address,
    //   ANNEngine: contracts.annEngine.options.address,
    //   ANNRegistry: contracts.annRegistry.options.address,
    //   CECActor: contracts.cecActor.options.address,
    //   // CECEncoder: contracts.cecEncoder.options.address,
    //   CECEngine: contracts.cecEngine.options.address,
    //   CECRegistry: contracts.cecRegistry.options.address,
    //   CEGActor: contracts.cegActor.options.address,
    //   // CEGEncoder: contracts.cegEncoder.options.address,
    //   CEGEngine: contracts.cegEngine.options.address,
    //   CEGRegistry: contracts.cegRegistry.options.address,
    //   Custodian: contracts.custodian.options.address,
    //   FDTFactory: contracts.fdtFactory.options.address,
    //   MarketObjectRegistry: contracts.marketObjectRegistry.options.address,
    //   PAMActor: contracts.pamActor.options.address,
    //   // PAMEncoder: contracts.pamEncoder.options.address,
    //   PAMEngine: contracts.pamEngine.options.address,
    //   PAMRegistry: contracts.pamRegistry.options.address,
    //   // ScheduleEncoder: contracts.scheduleEncoder.options.address,
    //   SignedMath: contracts.signedMath.options.address,
    //   // StateEncoder: contracts.stateEncoder.options.address,
    // }

    expect(contracts instanceof Contracts).toBe(true);
    // expect(initializedAddresses).toEqual(addressBook);
  });

  it('should return instance of IEngine for a given address', async (): Promise<void> => {
    expect(
      contracts.engine('0', '0x0000000000000000000000000000000000000001').options.address === '0x0000000000000000000000000000000000000001'
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
