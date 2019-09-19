import Web3 from 'web3';
import { Contract, DeployTransactionResponse } from 'web3-eth-contract/types';

import { TransactionObject} from '../types';

import FDT_ERC20ExtensionArtifact from '@atpar/ap-contracts/artifacts/FDT_ERC20Extension.min.json';


export class FDT_ERC20Extension {
  public instance: Contract;

  private constructor (instance: Contract) {
    this.instance = instance;
  }

  public updateFundsReceived (instanceAddress: string): TransactionObject {
    const instance = this.instance.clone();
    instance.options.address = instanceAddress;

    return instance.methods.updateFundsReceived();
  }

  public deploy (ownerAddress: string, fundsToken: string): DeployTransactionResponse {  
    const instance = this.instance.clone();

    return instance.deploy(
      // @ts-ignore
      { data: FDT_ERC20ExtensionArtifact.bytecode, arguments: [ownerAddress, fundsToken] }
    );
  }

  public static async instantiate (web3: Web3): Promise<FDT_ERC20Extension> {
    const instance = new web3.eth.Contract(
      // @ts-ignore
      FDT_ERC20ExtensionArtifact.abi,
    );

    return new FDT_ERC20Extension(instance);
  }
}
