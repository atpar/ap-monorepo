export class OwnershipKernel {

  public readonly contractId: string;
  public readonly recordCreatorAddress: string;
  public readonly counterpartyAddress: string;

  constructor (
    contractId: string, 
    recordCreatorAddress: string, 
    counterpartyAddress: string
  ) {
    this.contractId = contractId;
    this.recordCreatorAddress = recordCreatorAddress;
    this.counterpartyAddress = counterpartyAddress
  }
}
