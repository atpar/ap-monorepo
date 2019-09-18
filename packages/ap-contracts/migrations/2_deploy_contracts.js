const ANNEngine = artifacts.require('ANNEngine');
const PAMEngine = artifacts.require('PAMEngine');
const SignedMath = artifacts.require('SignedMath');

const AssetRegistry = artifacts.require('AssetRegistry');
const PaymentRegistry = artifacts.require('PaymentRegistry');
const PaymentRouter = artifacts.require('PaymentRouter');

const AssetActor = artifacts.require('AssetActor');
const AssetIssuer = artifacts.require('AssetIssuer');

const TokenizationFactory = artifacts.require('TokenizationFactory');


module.exports = async (deployer, network, accounts) => {

  // ACTUS-Solidity
  await deployer.deploy(SignedMath);
  await deployer.link(SignedMath, PAMEngine);
  await deployer.deploy(PAMEngine);
  await deployer.link(SignedMath, ANNEngine);
  await deployer.deploy(ANNEngine);

  // Core
  await deployer.deploy(AssetRegistry);
  const PaymentRegistryInstance = await deployer.deploy(PaymentRegistry);
  await deployer.deploy(
    PaymentRouter, 
    AssetRegistry.address, 
    PaymentRegistry.address
  );
  await PaymentRegistryInstance.setPaymentRouter(PaymentRouter.address);
  
  // Core: Asset Actor
  await deployer.deploy(
    AssetActor,
    AssetRegistry.address,
    PaymentRegistry.address,
    PaymentRouter.address
  );

  // Issuance
  await deployer.deploy(AssetIssuer);

  // Tokenization
  await deployer.deploy(
    TokenizationFactory,
    AssetRegistry.address,
    PaymentRouter.address
  );

  // await AssetActorInstance.registerIssuer(AssetIssuer.address);
};
