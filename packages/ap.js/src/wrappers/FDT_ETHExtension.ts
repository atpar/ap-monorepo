import Web3 from 'web3';
import { Contract, DeployTransactionResponse } from 'web3-eth-contract/types';

import FDT_ETHExtensionArtifact from '@atpar/ap-contracts/artifacts/FDT_ETHExtension.min.json';


export class FDT_ETHExtension {
  public instance: Contract;

  private constructor (instance: Contract) {
    this.instance = instance;
  }

  public deploy (ownerAddress: string): DeployTransactionResponse {  
    const instance = this.instance.clone();

    return instance.deploy(
      // @ts-ignore
      { data: FDT_ETHExtensionArtifact.bytecode, arguments: [ownerAddress] }
    );
  }

  public static async instantiate (web3: Web3): Promise<FDT_ETHExtension> {
    const instance = new web3.eth.Contract(
      // @ts-ignore
      FDT_ETHExtensionArtifact.abi,
    );

    return new FDT_ETHExtension(instance);
  }
}
