import Web3 from 'web3';
import { Contract } from 'web3-eth-contract/types';

import Deployments from '@atpar/ap-contracts/deployments.json';
import IEngineArtifact from '@atpar/ap-contracts/artifacts/IEngine.min.json';

import { IEngine } from './IEngine';

export class PAMEngine extends IEngine {
  private constructor (instance: Contract) {    
    super(instance);
  }

  public static async instantiate (web3: Web3, customAddress?: string): Promise<PAMEngine> {
    const netId = await web3.eth.net.getId();
    // @ts-ignore
    if (!customAddress && (!Deployments[netId] || !Deployments[netId].PAMEngine)) { 
      throw(new Error('INITIALIZATION_ERROR: Contract not deployed on Network!'));
    }
    const instance = new web3.eth.Contract(
      // @ts-ignore
      IEngineArtifact.abi,
      // @ts-ignore
      customAddress || Deployments[netId].PAMEngine
    );

    return new PAMEngine(instance);
  }
}
