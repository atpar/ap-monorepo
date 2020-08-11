const fs = require('fs');
const path = require('path');

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

const SettlementToken = artifacts.require('SettlementToken');


(async () => {
  // ACTUS-Solidity
  console.log('Deploying ACTUS-Solidity');
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
  await ANNRegistry.link(ANNEncoderInstance);
  await CECRegistry.link(CECEncoderInstance);
  await CEGRegistry.link(CEGEncoderInstance);
  await CERTFRegistry.link(CERTFEncoderInstance);
  await PAMRegistry.link(PAMEncoderInstance);
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


  console.log(`
    Deployments:
    
      ANNActor: ${ANNActorInstance.address}
      ANNEngine: ${ANNEngineInstance.address}
      ANNRegistry: ${ANNRegistryInstance.address}
      CECActor: ${CECActorInstance.address}
      CECEngine: ${CECEngineInstance.address}
      CECRegistry: ${CECRegistryInstance.address}
      CEGActor: ${CEGActorInstance.address}
      CEGEngine: ${CEGEngineInstance.address}
      CEGRegistry: ${CEGRegistryInstance.address}
      CERTFActor: ${CERTFActorInstance.address}
      CERTFEngine: ${CERTFEngineInstance.address}
      CERTFRegistry: ${CERTFRegistryInstance.address}
      Custodian: ${CustodianInstance.address}
      FDTFactory: ${FDTFactoryInstance.address}
      DataRegistry: ${DataRegistryInstance.address}
      PAMActor: ${PAMActorInstance.address}
      PAMEngine: ${PAMEngineInstance.address}
      PAMRegistry: ${PAMRegistryInstance.address}
  `);

  // deploy settlement token (necessary for registering templates on testnets)
  const SettlementTokenInstance = await SettlementToken.new();
  console.log('    Deployed Settlement Token: ' + SettlementTokenInstance.address);
  console.log('');

  // update address for ap-chain or goerli deployment
  const deployments = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'deployments.json'), 'utf8'));
  deployments[await web3.eth.net.getId()] = {
    "ANNActor": ANNActorInstance.address,
    "ANNEngine": ANNEngineInstance.address,
    "ANNRegistry": ANNRegistryInstance.address,
    "CECActor": CECActorInstance.address,
    "CECEngine": CECEngineInstance.address,
    "CECRegistry": CECRegistryInstance.address,
    "CEGActor": CEGActorInstance.address,
    "CEGEngine": CEGEngineInstance.address,
    "CEGRegistry": CEGRegistryInstance.address,
    "CERTFActor": CERTFActorInstance.address,
    "CERTFEngine": CERTFEngineInstance.address,
    "CERTFRegistry": CERTFRegistryInstance.address,
    "Custodian": CustodianInstance.address,
    "FDTFactory": FDTFactoryInstance.address,
    "DataRegistry": DataRegistryInstance.address,
    "PAMActor": PAMActorInstance.address,
    "PAMEngine": PAMEngineInstance.address,
    "PAMRegistry": PAMRegistryInstance.address,
  }
  fs.writeFileSync(path.resolve(__dirname, '../', 'deployments.json'), JSON.stringify(deployments, null, 2), 'utf8');
})();
