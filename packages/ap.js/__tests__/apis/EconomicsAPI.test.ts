import Web3 from 'web3';

import { EconomicsAPI, ContractsAPI } from '../../src/apis';
import { ContractTerms, ContractType } from '../../src/types';

// @ts-ignore
import DefaultTerms from '../DefaultTerms.json';


describe('EconomicsAPI', () => {

  let web3: Web3;
  let contractsAPI: ContractsAPI;
  let economicsAPI: EconomicsAPI;

  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    contractsAPI = await ContractsAPI.init(web3);
    economicsAPI = new EconomicsAPI(contractsAPI);
  });

  it('should instantiate EconomicsAPI', async () => {
    const economicsAPI = new EconomicsAPI(await ContractsAPI.init(web3));

    expect(economicsAPI instanceof EconomicsAPI).toBe(true);
  });

  it('should return a value for an instantiated engine from a given contract type and or address', async () => {
    const terms: ContractTerms = DefaultTerms;

    expect(
      await economicsAPI.engine(ContractType.PAM).computeInitialState(terms)
    ).toBeDefined();
  
    expect(
      await economicsAPI.engine(ContractType.PAM, contractsAPI.pamEngine.instance.options.address).computeInitialState(terms)
    ).toBeDefined();
  });

  it('should return a value for all instantiated engines', async () => {
    const terms: ContractTerms = DefaultTerms;

    const pam_initialState = await economicsAPI.engine(ContractType.PAM).computeInitialState(terms);

    expect(pam_initialState).toBeDefined();
    
    const ann_initialState = await economicsAPI.engine(ContractType.ANN).computeInitialState(
      { ...terms, contractType: ContractType.ANN }
    );

    expect(ann_initialState).toBeDefined();
  });
});
