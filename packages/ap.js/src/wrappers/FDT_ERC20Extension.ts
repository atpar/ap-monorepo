import Web3 from 'web3';
import { Contract, DeployTransactionResponse } from 'web3-eth-contract/types';

import { TransactionObject} from '../types';

import FDT_ERC20ExtensionArtifact from '@atpar/ap-contracts/artifacts/FDT_ERC20Extension.min.json';


export class FDT_ERC20Extension {

  private fundsDistributionToken: Contract;

  private constructor (fundsDistributionTokenInstance: Contract) {
    this.fundsDistributionToken = fundsDistributionTokenInstance;
  }

  public updateFundsReceived (fundsDistributionTokenAddress: string): TransactionObject {
    const fundsDistributionTokenInstance = this.fundsDistributionToken.clone();
    fundsDistributionTokenInstance.options.address = fundsDistributionTokenAddress;

    return fundsDistributionTokenInstance.methods.updateFundsReceived();
  }

  public deploy (ownerAddress: string, fundsToken: string): DeployTransactionResponse {  
    const fundsDistributionTokenInstance = this.fundsDistributionToken.clone();

    return fundsDistributionTokenInstance.deploy(
      // @ts-ignore
      { data: FDT_ERC20ExtensionArtifact.bytecode, arguments: [ownerAddress, fundsToken] }
    );
  }

  public static async instantiate (web3: Web3): Promise<FDT_ERC20Extension> {
    const fundsDistributionTokenInstance = new web3.eth.Contract(
      // @ts-ignore
      FDT_ERC20ExtensionArtifact.abi,
    );

    return new FDT_ERC20Extension(fundsDistributionTokenInstance);
  }
}
