import Web3 from 'web3';
import { Contract, DeployTransactionResponse } from 'web3-eth-contract/types';

import ClaimsTokenETHExtensionArtifact from '@atpar/ap-contracts/build/contracts/ClaimsTokenETHExtension.json';


export class ClaimsTokenETHExtension {

  private claimsToken: Contract;

  private constructor (claimsTokenInstance: Contract) {
    this.claimsToken = claimsTokenInstance;
  }

  public deploy (ownerAddress: string): DeployTransactionResponse {  
    const claimsTokenInstance = this.claimsToken.clone();

    return claimsTokenInstance.deploy(
      { data: ClaimsTokenETHExtensionArtifact.bytecode, arguments: [ownerAddress] }
    );
  }

  public static async instantiate (web3: Web3): Promise<ClaimsTokenETHExtension> {
    const claimsTokenInstance = new web3.eth.Contract(
      // @ts-ignore
      ClaimsTokenETHExtensionArtifact.abi,
    );

    return new ClaimsTokenETHExtension(claimsTokenInstance);
  }
}
