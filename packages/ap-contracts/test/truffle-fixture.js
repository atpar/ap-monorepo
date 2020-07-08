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

const ANNEncoder = artifacts.require('ANNEncoder');
const CECEncoder = artifacts.require('CECEncoder');
const CEGEncoder = artifacts.require('CEGEncoder');
const CERTFEncoder = artifacts.require('CERTFEncoder');
const PAMEncoder = artifacts.require('PAMEncoder');

const ANNActor = artifacts.require('ANNActor');
const CECActor = artifacts.require('CECActor');
const CEGActor = artifacts.require('CEGActor');
const CERTFActor = artifacts.require('CERTFActor');
const PAMActor = artifacts.require('PAMActor');

const DataRegistry = artifacts.require('DataRegistry');
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
  const ANNEncoderInstance = await ANNEncoder.new();
  ANNEncoder.setAsDeployed(ANNEncoderInstance);
  const CECEncoderInstance = await CECEncoder.new();
  CECEncoder.setAsDeployed(CECEncoderInstance);
  const CEGEncoderInstance = await CEGEncoder.new();
  CEGEncoder.setAsDeployed(CEGEncoderInstance);
  const CERTFEncoderInstance = await CERTFEncoder.new();
  CERTFEncoder.setAsDeployed(CERTFEncoderInstance);
  const PAMEncoderInstance = await PAMEncoder.new();
  PAMEncoder.setAsDeployed(PAMEncoderInstance);
  try { await ANNRegistry.link(ANNEncoderInstance); } catch(error) {}
  try { await CECRegistry.link(CECEncoderInstance); } catch(error) {}
  try { await CEGRegistry.link(CEGEncoderInstance); } catch(error) {}
  try { await CERTFRegistry.link(CERTFEncoderInstance); } catch(error) {}
  try { await PAMRegistry.link(PAMEncoderInstance); } catch(error) {}
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

  // Data Registry
  const DataRegistryInstance = await DataRegistry.new();
  DataRegistry.setAsDeployed(DataRegistryInstance);

  // Asset Actor
  const ANNActorInstance = await ANNActor.new(ANNRegistryInstance.address, DataRegistryInstance.address);
  ANNActor.setAsDeployed(ANNActorInstance);
  const CECActorInstance = await CECActor.new(CECRegistryInstance.address, DataRegistryInstance.address);
  CECActor.setAsDeployed(CECActorInstance);
  const CEGActorInstance = await CEGActor.new(CEGRegistryInstance.address, DataRegistryInstance.address);
  CEGActor.setAsDeployed(CEGActorInstance);
  const CERTFActorInstance = await CERTFActor.new(CERTFRegistryInstance.address, DataRegistryInstance.address);
  CERTFActor.setAsDeployed(CERTFActorInstance);
  const PAMActorInstance = await PAMActor.new(PAMRegistryInstance.address, DataRegistryInstance.address);
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
