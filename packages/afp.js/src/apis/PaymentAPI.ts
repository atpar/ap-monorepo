import Web3 from 'web3';

import { PaymentRegistry } from "../wrappers/PaymentRegistry";
import { PaymentRouter } from "../wrappers/PaymentRouter";


export class PaymentAPI {

  // @ts-ignore
  private registry: PaymentRegistry;
  // @ts-ignore
  private router: PaymentRouter;
  
  private constructor (registry: PaymentRegistry, router: PaymentRouter) {
    this.registry = registry;
    this.router = router;
  }

  /**
   * returns a new instance of the PaymentAPI class
   * @param {Web3} web3 web3 instance
   * @returns {Promise<PaymentAPI>}
   */
  public static async init (web3: Web3): Promise<PaymentAPI> {
    const registry = await PaymentRegistry.instantiate(web3);
    const router = await PaymentRouter.instantiate(web3);

    return new PaymentAPI(registry, router);
  }
}
