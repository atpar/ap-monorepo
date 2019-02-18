import { SendOptions } from 'web3-eth-contract/types';

import { ContractTerms, ContractType, SignedContractUpdate } from './types';
import { Channel } from './channel/Channel';
import { EconomicsKernel, OwnershipKernel } from './kernels';
import { PAM } from './economics';
import { AFP } from './index';


/**
 * manages financial channel for a contract
 * proxy for initializing and processing contract
 */
export class Contract {
  
  public economicsKernel: EconomicsKernel;
  public ownershipKernel: OwnershipKernel;
  public channel: Channel;

  private constructor (
    channel: Channel,
    economicsKernel: EconomicsKernel,
    ownershipKernel: OwnershipKernel
  ) {
    this.economicsKernel = economicsKernel;
    this.ownershipKernel = ownershipKernel;
    this.channel = channel;
  }

  /**
   * returns a new Contract instance
   * computes the first contract state and deploys the stateful contract,
   * prompts for signing the first contract update eand sends it
   * @param afp AFP instance
   * @param contractTerms contract terms
   * @param recordCreatorAddress address of the record creator
   * @param counterpartyAddress address of the counterparty
   * @param txOptions transaction options, see web3 send opions (optional)
   * @returns Contract
   */
  public static async create (
    afp: AFP,
    contractTerms: ContractTerms,
    recordCreatorAddress: string,
    counterpartyAddress: string,
    // @ts-ignore
    txOptions?: SendOptions
  ) {
    const contractId = 'PAM' + String(Math.floor(Date.now() / 1000));

    let economicsKernel;
    switch (contractTerms.contractType) {
      case ContractType.PAM:
        economicsKernel = await PAM.create(afp.web3, contractTerms);        
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }

    const ownershipKernel = new OwnershipKernel(contractId, recordCreatorAddress, counterpartyAddress);
    const channel = Channel.create(afp, economicsKernel, ownershipKernel);

    await channel.signAndSendNextContractUpdate(contractTerms.statusDate); // move out

    return new Contract(channel, economicsKernel, ownershipKernel);
  }

  // public static async load () {
  //   return new Error('NOT_IMPLEMENTED_ERROR: deserializing is not supported yet!');
  // }

  /**
   * returns a new Contract instance from a signed contract update
   * @param afp AFP instance
   * @param signedContractUpdate signed contract update
   * @returns Contract
   */
  public static async fromSignedContractUpdate (
    afp: AFP,
    signedContractUpdate: SignedContractUpdate
  ) {
    const contractId = signedContractUpdate.contractUpdate.contractId;
    const contractTerms = signedContractUpdate.contractUpdate.contractTerms;
    const contractState = signedContractUpdate.contractUpdate.contractState;

    let economicsKernel;
    switch (contractTerms.contractType) {
      case ContractType.PAM:
        economicsKernel = await PAM.init(afp.web3, contractTerms, contractState);
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }

    // get address of parties from smart contracts
    const ownershipKernel = new OwnershipKernel(contractId, '', '');
    const channel = await Channel.init(afp, economicsKernel, ownershipKernel, signedContractUpdate);

    return new Contract(channel, economicsKernel, ownershipKernel);
  }
}
