const ANNEngine = artifacts.require('ANNEngine');
const CECEngine = artifacts.require('CECEngine');
const CEGEngine = artifacts.require('CEGEngine');
const CERTFEngine = artifacts.require('CERTFEngine');
const PAMEngine = artifacts.require('PAMEngine');

const ANNRegistry = artifacts.require('ANNRegistry');
const CECRegistry = artifacts.require('CECRegistry');
const CEGRegistry = artifacts.require('CEGRegistry');
const CERTFRegistry = artifacts.require('CERTFRegistry');
const PAMRegistry = artifacts.require('PAMRegistry');

const ANNActor = artifacts.require('ANNActor');
const CECActor = artifacts.require('CECActor');
const CEGActor = artifacts.require('CEGActor');
const CERTFActor = artifacts.require('CERTFActor');
const PAMActor = artifacts.require('PAMActor');

const MarketObjectRegistry = artifacts.require('MarketObjectRegistry');
const Custodian = artifacts.require('Custodian');
const FDTFactory = artifacts.require('FDTFactory');


module.exports = async (accounts) => {
  // ACTUS-Solidity
  const ANNEngineInstance = await ANNEngine.new();
  ANNEngine.setAsDeployed(ANNEngineInstance);
  const CECEngineInstance = await CECEngine.new();
  CECEngine.setAsDeployed(CECEngineInstance);
  const CEGEngineInstance = await CEGEngine.new();
  CEGEngine.setAsDeployed(CEGEngineInstance);
  const CERTFEngineInstance = await CERTFEngine.new();
  CERTFEngine.setAsDeployed(CERTFEngineInstance);
  const PAMEngineInstance = await PAMEngine.new();
  PAMEngine.setAsDeployed(PAMEngineInstance);

  // Asset Registry
  const ANNRegistryInstance = await ANNRegistry.new();
  ANNRegistry.setAsDeployed(ANNRegistryInstance);
  const CECRegistryInstance = await CECRegistry.new();
  CECRegistry.setAsDeployed(CECRegistryInstance);
  const CEGRegistryInstance = await CEGRegistry.new();
  CEGRegistry.setAsDeployed(CEGRegistryInstance);
  const CERTFRegistryInstance = await CERTFRegistry.new();
  CERTFRegistry.setAsDeployed(CERTFRegistryInstance);
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
  const CERTFActorInstance = await CERTFActor.new(CERTFRegistryInstance.address, MarketObjectRegistryInstance.address);
  CERTFActor.setAsDeployed(CERTFActorInstance);
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
