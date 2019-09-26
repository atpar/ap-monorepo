import Web3 from 'web3';

import { AddressBook, ContractType } from '../types';

import { 
  IEngine,
  ANNEngine,
  PAMEngine, 
  AssetRegistry,
  PaymentRegistry, 
  PaymentRouter,
  AssetActor,
  AssetIssuer,
  TokenizationFactory,
  FundsDistributionToken,
  FDT_ETHExtension,
  FDT_ERC20Extension
} from '../wrappers';


export class ContractsAPI {

  public annEngine: ANNEngine;
  public pamEngine: PAMEngine;
  public assetRegistry: AssetRegistry;
  public paymentRegistry: PaymentRegistry;
  public paymentRouter: PaymentRouter;
  public assetActor: AssetActor;
  public assetIssuer: AssetIssuer;
  public tokenizationFactory: TokenizationFactory;
  public fundsDistributionToken: FundsDistributionToken;
  public fundsDistributionTokenETHExtension: FDT_ETHExtension;
  public fundsDistributionTokenERC20Extension: FDT_ERC20Extension;

  private engine: IEngine;


  private constructor (
    engine: IEngine,
    annEngine: ANNEngine,
    pamEngine: PAMEngine,
    assetRegistry: AssetRegistry,
    paymentRegistry: PaymentRegistry,
    paymentRouter: PaymentRouter,
    assetActor: AssetActor,
    assetIssuer: AssetIssuer,
    tokenizationFactory: TokenizationFactory,
    fundsDistributionToken: FundsDistributionToken,
    fundsDistributionTokenETHExtension: FDT_ETHExtension,
    fundsDistributionTokenERC20Extension: FDT_ERC20Extension
  ) {
    this.engine = engine;
    this.annEngine = annEngine;
    this.pamEngine = pamEngine;
    this.assetRegistry = assetRegistry;
    this.paymentRegistry = paymentRegistry;
    this.paymentRouter = paymentRouter;
    this.assetActor = assetActor;
    this.assetIssuer = assetIssuer;
    this.tokenizationFactory = tokenizationFactory;
    this.fundsDistributionToken = fundsDistributionToken;
    this.fundsDistributionTokenETHExtension = fundsDistributionTokenETHExtension;
    this.fundsDistributionTokenERC20Extension = fundsDistributionTokenERC20Extension;
  }

  /**
   * returns ACTUS engine contract by ContractType
   * @param {ContractType | string} contractTypeOrAddress ContractType or address of the engine 
   * @returns {IEngine}
   */
  public engineContract (contractTypeOrAddress: ContractType | string): IEngine {
    if (typeof contractTypeOrAddress === 'string') {
      return this.engine.instantiateAt(contractTypeOrAddress);  
    }

    switch (contractTypeOrAddress) {
      case ContractType.PAM: return this.pamEngine;
      case ContractType.ANN: return this.annEngine;
      default: throw new Error('NOT_IMPLEMENTED_ERROR: Unsupported contract type!');
    }
  }

  /**
   * initializes all AP contracts and returns a new instance of the ContractsAPI class
   * @param {Web3} web3 web3 instance
   * @param {AddressBook?} addressBook object containing custom addresses for ap-contacts
   * @returns {Promise<ContractsAPI>}
   */
  public static async init (web3: Web3, addressBook?: AddressBook): Promise<ContractsAPI> {
    return new ContractsAPI(
      await IEngine.instantiate(web3),
      await ANNEngine.instantiate(web3, (addressBook) ? addressBook.ANNEngine : undefined),
      await PAMEngine.instantiate(web3, (addressBook) ? addressBook.PAMEngine : undefined),
      await AssetRegistry.instantiate(web3, (addressBook) ? addressBook.AssetRegistry : undefined),
      await PaymentRegistry.instantiate(web3, (addressBook) ? addressBook.PaymentRegistry : undefined),
      await PaymentRouter.instantiate(web3, (addressBook) ? addressBook.PaymentRouter : undefined),
      await AssetActor.instantiate(web3, (addressBook) ? addressBook.AssetActor : undefined),
      await AssetIssuer.instantiate(web3, (addressBook) ? addressBook.AssetIssuer : undefined),
      await TokenizationFactory.instantiate(web3, (addressBook) ? addressBook.TokenizationFactory : undefined),
      await FundsDistributionToken.instantiate(web3),
      await FDT_ETHExtension.instantiate(web3),
      await FDT_ERC20Extension.instantiate(web3)
    );
  }
}
