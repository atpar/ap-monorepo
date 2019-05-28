import Web3 from 'web3';

import { 
  PAMEngine, 
  AssetRegistry,
  PaymentRegistry, 
  PaymentRouter,
  AssetActor,
  AssetIssuer,
  ClaimsToken,
  ClaimsTokenETHExtension,
  ClaimsTokenERC20Extension
} from '../wrappers';


export class ContractsAPI {

  public pamEngine: PAMEngine;
  public assetRegistry: AssetRegistry;
  public paymentRegistry: PaymentRegistry;
  public paymentRouter: PaymentRouter;
  public assetActor: AssetActor;
  public assetIssuer: AssetIssuer;

  public claimsToken: ClaimsToken;
  public claimsTokenETHExtension: ClaimsTokenETHExtension;
  public claimsTokenERC20Extension: ClaimsTokenERC20Extension;

  private constructor (
    pamEngine: PAMEngine,
    assetRegistry: AssetRegistry,
    paymentRegistry: PaymentRegistry,
    paymentRouter: PaymentRouter,
    assetActor: AssetActor,
    assetIssuer: AssetIssuer,
    claimsToken: ClaimsToken,
    claimsTokenETHExtension: ClaimsTokenETHExtension,
    claimsTokenERC20Extension: ClaimsTokenERC20Extension
  ) {
    this.pamEngine = pamEngine;
    this.assetRegistry = assetRegistry;
    this.paymentRegistry = paymentRegistry;
    this.paymentRouter = paymentRouter;
    this.assetActor = assetActor;
    this.assetIssuer = assetIssuer;
    this.claimsToken = claimsToken;
    this.claimsTokenETHExtension = claimsTokenETHExtension;
    this.claimsTokenERC20Extension = claimsTokenERC20Extension;
  }

  /**
   * initializes all AP contracts and returns a new instance of the ContractsAPI class
   * @param {Web3} web3 web3 instance
   * @returns {Promise<ContractsAPI>}
   */
  public static async init (web3: Web3): Promise<ContractsAPI> {
    return new ContractsAPI(
      await PAMEngine.instantiate(web3),
      await AssetRegistry.instantiate(web3),
      await PaymentRegistry.instantiate(web3),
      await PaymentRouter.instantiate(web3),
      await AssetActor.instantiate(web3),
      await AssetIssuer.instantiate(web3),
      await ClaimsToken.instantiate(web3),
      await ClaimsTokenETHExtension.instantiate(web3),
      await ClaimsTokenERC20Extension.instantiate(web3)
    );
  }
}
