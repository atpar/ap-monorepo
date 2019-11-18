const PAMEngine = artifacts.require('PAMEngine');
const ANNEngine = artifacts.require('ANNEngine');
// const CEGEngine = artifacts.require('CEGEngine');
const AssetRegistry = artifacts.require('AssetRegistry')
const AssetActor = artifacts.require('AssetActor');
const AssetIssuer = artifacts.require('AssetIssuer');
const ProductRegistry = artifacts.require('ProductRegistry');
const TokenizationFactory = artifacts.require('TokenizationFactory');


async function setupTestEnvironment () {
  const instances = {};

  PAMEngine.numberFormat = 'String';

  // deploy ACTUS Solidity
  instances.PAMEngineInstance = await PAMEngine.new();
  instances.ANNEngineInstance = await ANNEngine.new();
  // instances.CEGEngineInstance = await CEGEngine.new();
  
  // deploy Core
  instances.ProductRegistryInstance = await ProductRegistry.new();
  instances.AssetRegistryInstance = await AssetRegistry.new(
    instances.ProductRegistryInstance.address
  );
  instances.AssetActorInstance = await AssetActor.new(
    instances.AssetRegistryInstance.address,
    instances.ProductRegistryInstance.address
  );

  // deploy Issuance
  instances.AssetIssuerInstance = await AssetIssuer.new();

  // deploy Tokenization
  instances.TokenizationFactoryInstance = await TokenizationFactory.new(
    instances.AssetRegistryInstance.address
  );

  await instances.AssetActorInstance.registerIssuer(instances.AssetIssuerInstance.address);

  return instances;
}

function getDefaultTerms () {
  return require('actus-solidity/test/helper/tests').getDefaultTestTerms('PAM');
}

module.exports = { setupTestEnvironment, getDefaultTerms };
