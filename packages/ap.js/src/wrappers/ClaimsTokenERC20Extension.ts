import Web3 from 'web3';
import { Contract, DeployTransactionResponse } from 'web3-eth-contract/types';

import { TransactionObject} from '../types';

import ClaimsTokenERC20ExtensionArtifact from '@atpar/ap-contracts/artifacts/ClaimsTokenERC20Extension.min.json';


export class ClaimsTokenERC20Extension {

  private claimsToken: Contract;

  private constructor (claimsTokenInstance: Contract) {
    this.claimsToken = claimsTokenInstance;
  }

  public updateFundsReceived (claimsTokenAddress: string): TransactionObject {
    const claimsTokenInstance = this.claimsToken.clone();
    claimsTokenInstance.options.address = claimsTokenAddress;

    return claimsTokenInstance.methods.updateFundsReceived();
  }

  public deploy (ownerAddress: string, fundsToken: string): DeployTransactionResponse {  
    const claimsTokenInstance = this.claimsToken.clone();

    return claimsTokenInstance.deploy(
      // @ts-ignore
      { data: ClaimsTokenERC20ExtensionArtifact.bytecode, arguments: [ownerAddress, fundsToken] }
    );
  }

  public static async instantiate (web3: Web3): Promise<ClaimsTokenERC20Extension> {
    const claimsTokenInstance = new web3.eth.Contract(
      // @ts-ignore
      ClaimsTokenERC20ExtensionArtifact.abi,
    );

    return new ClaimsTokenERC20Extension(claimsTokenInstance);
  }
}
