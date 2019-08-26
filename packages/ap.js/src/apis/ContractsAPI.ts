import Web3 from 'web3';

import { 
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

  private constructor (
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
   * initializes all AP contracts and returns a new instance of the ContractsAPI class
   * @param {Web3} web3 web3 instance
   * @returns {Promise<ContractsAPI>}
   */
  public static async init (web3: Web3): Promise<ContractsAPI> {
    return new ContractsAPI(
      await ANNEngine.instantiate(web3),
      await PAMEngine.instantiate(web3),
      await AssetRegistry.instantiate(web3),
      await PaymentRegistry.instantiate(web3),
      await PaymentRouter.instantiate(web3),
      await AssetActor.instantiate(web3),
      await AssetIssuer.instantiate(web3),
      await TokenizationFactory.instantiate(web3),
      await FundsDistributionToken.instantiate(web3),
      await FDT_ETHExtension.instantiate(web3),
      await FDT_ERC20Extension.instantiate(web3)
    );
  }
}
