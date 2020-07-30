/* global artifacts */
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
const ProxySafeVanillaFDT = artifacts.require('ProxySafeVanillaFDT');
const ProxySafeSimpleRestrictedFDT = artifacts.require('ProxySafeSimpleRestrictedFDT');

const ProxySafeICT = artifacts.require('ProxySafeICT');
const ICTFactory = artifacts.require('ICTFactory');

const SettlementToken = artifacts.require('SettlementToken');


module.exports = async (deployer, network) => {
  const instances = {};

  // ACTUS-Solidity
  instances.ANNEngineInstance = await deployer.deploy(ANNEngine);
  instances.CECEngineInstance = await deployer.deploy(CECEngine);
  instances.CEGEngineInstance = await deployer.deploy(CEGEngine);
  instances.CERTFEngineInstance = await deployer.deploy(CERTFEngine);
  instances.PAMEngineInstance = await deployer.deploy(PAMEngine);

  // Asset Registry
  await deployer.deploy(ANNEncoder);
  await deployer.deploy(CECEncoder);
  await deployer.deploy(CEGEncoder);
  await deployer.deploy(CERTFEncoder);
  await deployer.deploy(PAMEncoder);
  deployer.link(ANNEncoder, ANNRegistry);
  deployer.link(CECEncoder, CECRegistry);
  deployer.link(CEGEncoder, CEGRegistry);
  deployer.link(CERTFEncoder, CERTFRegistry);
  deployer.link(PAMEncoder, PAMRegistry);
  instances.ANNRegistryInstance = await deployer.deploy(ANNRegistry);
  instances.CECRegistryInstance = await deployer.deploy(CECRegistry);
  instances.CEGRegistryInstance = await deployer.deploy(CEGRegistry);
  instances.CERTFRegistryInstance = await deployer.deploy(CERTFRegistry);
  instances.PAMRegistryInstance = await deployer.deploy(PAMRegistry);

  // Market Object Registry
  instances.DataRegistryInstance = await deployer.deploy(DataRegistry);

  // Asset Actor
  instances.ANNActorInstance = await deployer.deploy(ANNActor, ANNRegistry.address, DataRegistry.address);
  instances.CECActorInstance = await deployer.deploy(CECActor, CECRegistry.address, DataRegistry.address);
  instances.CEGActorInstance = await deployer.deploy(CEGActor, CEGRegistry.address, DataRegistry.address);
  instances.CERTFActorInstance = await deployer.deploy(CERTFActor, CERTFRegistry.address, DataRegistry.address);
  instances.PAMActorInstance = await deployer.deploy(PAMActor, PAMRegistry.address, DataRegistry.address);

  // approve Actors for the Asset Registries
  await instances.ANNRegistryInstance.approveActor(instances.ANNActorInstance.address);
  await instances.CECRegistryInstanceANNRegistryInstance.approveActor(instances.CECActorInstance.address);
  await instances.CEGRegistryInstanceANNRegistryInstance.approveActor(instances.CEGActorInstance.address);
  await instances.CERTFRegistryInstanceANNRegistryInstance.approveActor(instances.CERTFActorInstance.address);
  await instances.PAMRegistryInstanceANNRegistryInstance.approveActor(instances.PAMActorInstance.address);

  // Custodian
  instances.CustodianInstance = await deployer.deploy(
    Custodian,
    CECActor.address,
    CECRegistry.address
  );

  // FDT
  instances.ProxySafeVanillaFDTInstance = await deployer.deploy(ProxySafeVanillaFDT);
  instances.ProxySafeSimpleRestrictedFDTInstance = await deployer.deploy(ProxySafeSimpleRestrictedFDT);
  // Before the factory deployment, link pre-deployed "logic" contract(s)
  await FDTFactory.link('VanillaFDTLogic', instances.ProxySafeVanillaFDTInstance.address);
  await FDTFactory.link('SimpleRestrictedFDTLogic', instances.ProxySafeSimpleRestrictedFDTInstance.address);
  // Deploy the factory (with "logic" contract(s) linked)
  instances.FDTFactoryInstance = await deployer.deploy(FDTFactory);

  // ICT
  instances.ProxySafeICTInstance = await deployer.deploy(ProxySafeICT);
  // Before the factory deployment, link pre-deployed "logic" contract(s)
  await ICTFactory.link('ICTLogic', instances.ProxySafeICTInstance.address);
  // Deploy the factory (with "logic" contract(s) linked)
  instances.ICTFactoryInstance = await deployer.deploy(ICTFactory);

  console.log(`
    Deployments:
    
      ANNActor: ${ANNActor.address}
      ANNEngine: ${ANNEngine.address}
      ANNRegistry: ${ANNRegistry.address}
      CECActor: ${CECActor.address}
      CECEngine: ${CECEngine.address}
      CECRegistry: ${CECRegistry.address}
      CEGActor: ${CEGActor.address}
      CEGEngine: ${CEGEngine.address}
      CEGRegistry: ${CEGRegistry.address}
      CERTFActor: ${CERTFActor.address}
      CERTFEngine: ${CERTFEngine.address}
      CERTFRegistry: ${CERTFRegistry.address}
      Custodian: ${Custodian.address}
      FDTFactory: ${FDTFactory.address}
      DataRegistry: ${DataRegistry.address}
      ICTFactory: ${ICTFactory.address}
      PAMActor: ${PAMActor.address}
      PAMEngine: ${PAMEngine.address}
      PAMRegistry: ${PAMRegistry.address}
      ProxySafeSimpleRestrictedFDT: ${ProxySafeSimpleRestrictedFDT.address}
      ProxySafeICT: ${ProxySafeICT.address}
      ProxySafeVanillaFDT: ${ProxySafeVanillaFDT.address}
  `);

  // deploy settlement token (necessary for registering templates on testnets)
  await deployer.deploy(SettlementToken);
  console.log('    Deployed Settlement Token: ' + SettlementToken.address);
  console.log('');

  // update address for ap-chain or goerli deployment
  const deployments = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'deployments.json'), 'utf8'));
  deployments[await web3.eth.net.getId()] = {
    "ANNActor": ANNActor.address,
    "ANNEngine": ANNEngine.address,
    "ANNRegistry": ANNRegistry.address,
    "CECActor": CECActor.address,
    "CECEngine": CECEngine.address,
    "CECRegistry": CECRegistry.address,
    "CEGActor": CEGActor.address,
    "CEGEngine": CEGEngine.address,
    "CEGRegistry": CEGRegistry.address,
    "CERTFActor": CERTFActor.address,
    "CERTFEngine": CERTFEngine.address,
    "CERTFRegistry": CERTFRegistry.address,
    "Custodian": Custodian.address,
    "FDTFactory": FDTFactory.address,
    "DataRegistry": DataRegistry.address,
    "PAMActor": PAMActor.address,
    "PAMEngine": PAMEngine.address,
    "PAMRegistry": PAMRegistry.address,
  };
  fs.writeFileSync(path.resolve(__dirname, '../', 'deployments.json'), JSON.stringify(deployments, null, 2), 'utf8');
};
