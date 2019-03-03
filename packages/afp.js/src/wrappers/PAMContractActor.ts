import Web3 from 'web3';

import { Contract } from 'web3-eth-contract/types';
import { toHex } from '../utils/Utils';

const PAMContractActorArtifact: any = require('../../../afp-contracts/build/contracts/PAMContractActor.json');

export class PAMContractActor {
  private pamContractActor: Contract;

  private constructor (pamContractActorInstance: Contract) {
    this.pamContractActor = pamContractActorInstance
  }

  public async progress (contractId: string, timestamp: number) {
    await this.pamContractActor.methods.progress(toHex(contractId), timestamp);
  }

  public static async instantiate (web3: Web3) {
    const chainId = await web3.eth.net.getId();
    const pamContractActorInstance = new web3.eth.Contract(
      PAMContractActorArtifact.abi,
      PAMContractActorArtifact.networks[chainId].address
    );

    return new PAMContractActor(pamContractActorInstance);
  }
}