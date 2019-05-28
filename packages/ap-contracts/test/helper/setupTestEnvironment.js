const PAMEngine = artifacts.require('PAMEngine');
const AssetRegistry = artifacts.require('AssetRegistry')
const PaymentRegistry = artifacts.require('PaymentRegistry');
const PaymentRouter = artifacts.require('PaymentRouter');
const AssetActor = artifacts.require('AssetActor');
const AssetIssuer = artifacts.require('AssetIssuer.sol');


async function setupTestEnvironment () {
  const instances = {};

  PAMEngine.numberFormat = 'String';
  PaymentRouter.numberFormat = 'String';

  // deploy APCore
  instances.PAMEngineInstance = await PAMEngine.new();
  
  // deploy APExtended
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

  // deploy APIssuance
  instances.AssetIssuerInstance = await AssetIssuer.new();

  await instances.PaymentRegistryInstance.setPaymentRouter(instances.PaymentRouterInstance.address);
  await instances.AssetActorInstance.registerIssuer(instances.AssetIssuerInstance.address);

  return instances;
}

function getDefaultTerms () {
  return require('actus-solidity/actus-resources/test-terms/Test-PAM-10001.json');
}

module.exports = { setupTestEnvironment, getDefaultTerms };
