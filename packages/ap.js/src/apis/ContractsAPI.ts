import Web3 from 'web3';

import { 
  PAMEngine, 
  EconomicsRegistry, 
  OwnershipRegistry, 
  PaymentRegistry, 
  PaymentRouter,
  PAMAssetActor,
  AssetIssuer,
  ClaimsToken
} from '../wrappers';


export class ContractsAPI {

  public pamEngine: PAMEngine;
  public economicsRegistry: EconomicsRegistry;
  public ownershipRegistry: OwnershipRegistry;
  public paymentRegistry: PaymentRegistry;
  public paymentRouter: PaymentRouter;
  public assetActor: PAMAssetActor;
  public assetIssuer: AssetIssuer;
  public claimsToken: ClaimsToken;

  private constructor (
    pamEngine: PAMEngine,
    economicsRegistry: EconomicsRegistry,
    ownershipRegistry: OwnershipRegistry,
    paymentRegistry: PaymentRegistry,
    paymentRouter: PaymentRouter,
    assetActor: PAMAssetActor,
    assetIssuer: AssetIssuer,
    claimsToken: ClaimsToken
  ) {
    this.pamEngine = pamEngine;
    this.economicsRegistry = economicsRegistry;
    this.ownershipRegistry = ownershipRegistry;
    this.paymentRegistry = paymentRegistry;
    this.paymentRouter = paymentRouter;
    this.assetActor = assetActor;
    this.assetIssuer = assetIssuer;
    this.claimsToken = claimsToken;
  }

  /**
   * initializes all AP contracts and returns a new instance of the ContractsAPI class
   * @param {Web3} web3 web3 instance
   * @returns {Promise<ContractsAPI>}
   */
  public static async init (web3: Web3): Promise<ContractsAPI> {
    return new ContractsAPI(
      await PAMEngine.instantiate(web3),
      await EconomicsRegistry.instantiate(web3),
      await OwnershipRegistry.instantiate(web3),
      await PaymentRegistry.instantiate(web3),
      await PaymentRouter.instantiate(web3),
      await PAMAssetActor.instantiate(web3),
      await AssetIssuer.instantiate(web3),
      await ClaimsToken.instantiate(web3)
    );
  }
}
