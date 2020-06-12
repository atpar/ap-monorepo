const PAMEngine = artifacts.require('PAMEngine');
const ANNEngine = artifacts.require('ANNEngine');
const CEGEngine = artifacts.require('CEGEngine');
const CECEngine = artifacts.require('CECEngine');

const MarketObjectRegistry = artifacts.require('MarketObjectRegistry');
const AssetRegistry = artifacts.require('AssetRegistry')
const AssetActor = artifacts.require('AssetActor');
const AssetIssuer = artifacts.require('AssetIssuer');
const Custodian = artifacts.require('Custodian');
const TokenizationFactory = artifacts.require('TokenizationFactory')


module.exports = async (accounts) => {
  PAMEngine.numberFormat = 'String';

  // deploy ACTUS Solidity
  const PAMEngineInstance = await PAMEngine.new();
  PAMEngine.setAsDeployed(PAMEngineInstance);
  const ANNEngineInstance = await ANNEngine.new();
  ANNEngine.setAsDeployed(ANNEngineInstance);
  const CEGEngineInstance = await CEGEngine.new();
  CEGEngine.setAsDeployed(CEGEngineInstance);
  const CECEngineInstance = await CECEngine.new();
  CECEngine.setAsDeployed(CECEngineInstance);

  // deploy Core
  const AssetRegistryInstance = await AssetRegistry.new()
  AssetRegistry.setAsDeployed(AssetRegistryInstance);
  const MarketObjectRegistryInstance = await MarketObjectRegistry.new();
  MarketObjectRegistry.setAsDeployed(MarketObjectRegistryInstance);
  const AssetActorInstance = await AssetActor.new(
    AssetRegistryInstance.address,
    MarketObjectRegistryInstance.address
  );
  AssetActor.setAsDeployed(AssetActorInstance);
  const CustodianInstance = await Custodian.new(
    AssetActorInstance.address,
    AssetRegistryInstance.address
  );
  Custodian.setAsDeployed(CustodianInstance);

  // deploy Issuance
  const AssetIssuerInstance = await AssetIssuer.new(
    CustodianInstance.address,
    AssetRegistryInstance.address,
    AssetActorInstance.address
  );
  AssetIssuer.setAsDeployed(AssetIssuerInstance);

  // deploy Tokenization
  TokenizationFactoryInstance = await TokenizationFactory.new(AssetRegistryInstance.address);
  TokenizationFactory.setAsDeployed(TokenizationFactoryInstance);

  await AssetActorInstance.registerIssuer(AssetIssuerInstance.address);
}