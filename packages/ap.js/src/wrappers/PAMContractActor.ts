import Web3 from 'web3';

import { Contract, SendOptions } from 'web3-eth-contract/types';
import { toHex } from '../utils/Utils';

const PAMContractActorArtifact: any = require('../../../ap-contracts/build/contracts/PAMContractActor.json');

export class PAMContractActor {
  private pamContractActor: Contract;

  private constructor (pamContractActorInstance: Contract) {
    this.pamContractActor = pamContractActorInstance
  }

  public async progress (
    assetId: string, 
    timestamp: number, 
    txOptions?: SendOptions
  ): Promise<void> {
    await this.pamContractActor.methods.progress(toHex(assetId), timestamp).send({ ...txOptions });
  }

  public static async instantiate (web3: Web3): Promise<PAMContractActor> {
    const chainId = await web3.eth.net.getId();
    const pamContractActorInstance = new web3.eth.Contract(
      PAMContractActorArtifact.abi,
      PAMContractActorArtifact.networks[chainId].address
    );

    return new PAMContractActor(pamContractActorInstance);
  }
}