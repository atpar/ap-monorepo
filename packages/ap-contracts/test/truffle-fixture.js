const ANNEngine = artifacts.require('ANNEngine');
const PAMEngine = artifacts.require('PAMEngine');
const CEGEngine = artifacts.require('CEGEngine');
const CECEngine = artifacts.require('CECEngine');

const ANNRegistry = artifacts.require('ANNRegistry');
const CECRegistry = artifacts.require('CECRegistry');
const CEGRegistry = artifacts.require('CEGRegistry');
const PAMRegistry = artifacts.require('PAMRegistry');

const ANNActor = artifacts.require('ANNActor');
const CECActor = artifacts.require('CECActor');
const CEGActor = artifacts.require('CEGActor');
const PAMActor = artifacts.require('PAMActor');

const MarketObjectRegistry = artifacts.require('MarketObjectRegistry');
const Custodian = artifacts.require('Custodian');
const FDTFactory = artifacts.require('FDTFactory');


module.exports = async (accounts) => {
  // PAMEngine.numberFormat = 'String';

  // ACTUS-Solidity
  const PAMEngineInstance = await PAMEngine.new();
  PAMEngine.setAsDeployed(PAMEngineInstance);
  const ANNEngineInstance = await ANNEngine.new();
  ANNEngine.setAsDeployed(ANNEngineInstance);
  const CEGEngineInstance = await CEGEngine.new();
  CEGEngine.setAsDeployed(CEGEngineInstance);
  const CECEngineInstance = await CECEngine.new();
  CECEngine.setAsDeployed(CECEngineInstance);

  // Asset Registry
  const ANNRegistryInstance = await ANNRegistry.new();
  ANNRegistry.setAsDeployed(ANNRegistryInstance);
  const CECRegistryInstance = await CECRegistry.new();
  CECRegistry.setAsDeployed(CECRegistryInstance);
  const CEGRegistryInstance = await CEGRegistry.new();
  CEGRegistry.setAsDeployed(CEGRegistryInstance);
  const PAMRegistryInstance = await PAMRegistry.new();
  PAMRegistry.setAsDeployed(PAMRegistryInstance);

  // Market Object Registry
  const MarketObjectRegistryInstance = await MarketObjectRegistry.new();
  MarketObjectRegistry.setAsDeployed(MarketObjectRegistryInstance);

  // Asset Actor
  const ANNActorInstance = await ANNActor.new(ANNRegistryInstance.address, MarketObjectRegistryInstance.address);
  ANNActor.setAsDeployed(ANNActorInstance);
  const CECActorInstance = await CECActor.new(CECRegistryInstance.address, MarketObjectRegistryInstance.address);
  CECActor.setAsDeployed(CECActorInstance);
  const CEGActorInstance = await CEGActor.new(CEGRegistryInstance.address, MarketObjectRegistryInstance.address);
  CEGActor.setAsDeployed(CEGActorInstance);
  const PAMActorInstance = await PAMActor.new(PAMRegistryInstance.address, MarketObjectRegistryInstance.address);
  PAMActor.setAsDeployed(PAMActorInstance);

  // Custodian
  const CustodianInstance = await Custodian.new(
    CECActorInstance.address,
    CECRegistryInstance.address
  );
  Custodian.setAsDeployed(CustodianInstance);

  // FDT
  const FDTFactoryInstance = await FDTFactory.new();
  FDTFactory.setAsDeployed(FDTFactoryInstance);
}
