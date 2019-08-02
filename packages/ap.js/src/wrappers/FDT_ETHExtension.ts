import Web3 from 'web3';
import { Contract, DeployTransactionResponse } from 'web3-eth-contract/types';

import FDT_ETHExtensionArtifact from '@atpar/ap-contracts/artifacts/FDT_ETHExtension.min.json';


export class FDT_ETHExtension {

  private fundsDistributionToken: Contract;

  private constructor (fundsDistributionTokenInstance: Contract) {
    this.fundsDistributionToken = fundsDistributionTokenInstance;
  }

  public deploy (ownerAddress: string): DeployTransactionResponse {  
    const fundsDistributionTokenInstance = this.fundsDistributionToken.clone();

    return fundsDistributionTokenInstance.deploy(
      // @ts-ignore
      { data: FDT_ETHExtensionArtifact.bytecode, arguments: [ownerAddress] }
    );
  }

  public static async instantiate (web3: Web3): Promise<FDT_ETHExtension> {
    const fundsDistributionTokenInstance = new web3.eth.Contract(
      // @ts-ignore
      FDT_ETHExtensionArtifact.abi,
    );

    return new FDT_ETHExtension(fundsDistributionTokenInstance);
  }
}
