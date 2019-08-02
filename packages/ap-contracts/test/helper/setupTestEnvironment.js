const PAMEngine = artifacts.require('PAMEngine');
const AssetRegistry = artifacts.require('AssetRegistry')
const PaymentRegistry = artifacts.require('PaymentRegistry');
const PaymentRouter = artifacts.require('PaymentRouter');
const AssetActor = artifacts.require('AssetActor');
const AssetIssuer = artifacts.require('AssetIssuer');
const TokenizationFactory = artifacts.require('TokenizationFactory');


async function setupTestEnvironment () {
  const instances = {};

  PAMEngine.numberFormat = 'String';
  PaymentRouter.numberFormat = 'String';

  // deploy ACTUS Solidity
  instances.PAMEngineInstance = await PAMEngine.new();
  
  // deploy Core
  instances.AssetRegistryInstance = await AssetRegistry.new();
  instances.PaymentRegistryInstance = await PaymentRegistry.new();
  instances.PaymentRouterInstance = await PaymentRouter.new(
    instances.AssetRegistryInstance.address, 
    instances.PaymentRegistryInstance.address
  );
  instances.AssetActorInstance = await AssetActor.new(
    instances.AssetRegistryInstance.address,
    instances.PaymentRegistryInstance.address,
    instances.PaymentRouterInstance.address,
    instances.PAMEngineInstance.address
  );

  // deploy Issuance
  instances.AssetIssuerInstance = await AssetIssuer.new();

  // deploy Tokenization
  instances.TokenizationFactoryInstance = await TokenizationFactory.new(
    instances.AssetRegistryInstance.address,
    instances.PaymentRouterInstance.address
  );

  await instances.PaymentRegistryInstance.setPaymentRouter(instances.PaymentRouterInstance.address);

  await instances.AssetActorInstance.registerIssuer(instances.AssetIssuerInstance.address);

  return instances;
}

function getDefaultTerms () {
  return require('actus-solidity/actus-resources/test-terms/Test-PAM-10001.json');
}

module.exports = { setupTestEnvironment, getDefaultTerms };
