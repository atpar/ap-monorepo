const fs = require('fs');
const path = require('path');

const ANNEngine = artifacts.require('ANNEngine');
const PAMEngine = artifacts.require('PAMEngine');
const CEGEngine = artifacts.require('CEGEngine');
const CECEngine = artifacts.require('CECEngine');
const SignedMath = artifacts.require('SignedMath');

const ANNEncoder = artifacts.require('ANNEncoder');
const CECEncoder = artifacts.require('CECEncoder');
const CEGEncoder = artifacts.require('CEGEncoder');
const PAMEncoder = artifacts.require('PAMEncoder');
const StateEncoder = artifacts.require('StateEncoder');
const ScheduleEncoder = artifacts.require('ScheduleEncoder');

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
const SettlementToken = artifacts.require('SettlementToken');


module.exports = async (deployer, network) => {
  const instances = {};

  // ACTUS-Solidity
  instances.SignedMathInstance = await deployer.deploy(SignedMath);
  await deployer.link(SignedMath, PAMEngine);
  instances.PAMEngineInstance = await deployer.deploy(PAMEngine);
  await deployer.link(SignedMath, ANNEngine);
  instances.ANNEngineInstance = await deployer.deploy(ANNEngine);
  await deployer.link(SignedMath, CEGEngine);
  instances.CEGEngineInstance = await deployer.deploy(CEGEngine);
  await deployer.link(SignedMath, CECEngine);
  instances.CECEngineInstance = await deployer.deploy(CECEngine);

  // Asset Registry
  instances.ANNEncoderInstance = await deployer.deploy(ANNEncoder);
  instances.CECEncoderInstance = await deployer.deploy(CECEncoder);
  instances.CEGEncoderInstance = await deployer.deploy(CEGEncoder);
  instances.PAMEncoderInstance = await deployer.deploy(PAMEncoder);
  instances.StateEncoderInstance = await deployer.deploy(StateEncoder);
  instances.ScheduleEncoderInstance = await deployer.deploy(ScheduleEncoder);
  
  await deployer.link(ANNEncoder, ANNRegistry);
  await deployer.link(StateEncoder, ANNRegistry);
  await deployer.link(ScheduleEncoder, ANNRegistry);
  instances.ANNRegistryInstance = await deployer.deploy(ANNRegistry);

  await deployer.link(ANNEncoder, CECRegistry);
  await deployer.link(StateEncoder, CECRegistry);
  await deployer.link(ScheduleEncoder, CECRegistry);
  instances.CECRegistryInstance = await deployer.deploy(CECRegistry);
    
  await deployer.link(ANNEncoder, CEGRegistry);
  await deployer.link(StateEncoder, CEGRegistry);
  await deployer.link(ScheduleEncoder, CEGRegistry);
  instances.CEGRegistryInstance = await deployer.deploy(CEGRegistry);

  await deployer.link(ANNEncoder, PAMRegistry);
  await deployer.link(StateEncoder, PAMRegistry);
  await deployer.link(ScheduleEncoder, PAMRegistry);
  instances.PAMRegistryInstance = await deployer.deploy(PAMRegistry);

  // Market Object Registry
  instances.MarketObjectRegistryInstance = await deployer.deploy(MarketObjectRegistry);

  // Asset Actor
  instances.ANNActorInstance = await deployer.deploy(ANNActor, ANNRegistry.address, MarketObjectRegistry.address);
  instances.CECActorInstance = await deployer.deploy(CECActor, CECRegistry.address, MarketObjectRegistry.address);
  instances.CEGActorInstance = await deployer.deploy(CEGActor, CEGRegistry.address, MarketObjectRegistry.address);
  instances.PAMActorInstance = await deployer.deploy(PAMActor, PAMRegistry.address, MarketObjectRegistry.address);
  
  // Custodian
  instances.CustodianInstance = await deployer.deploy(
    Custodian,
    CECActor.address,
    CECRegistry.address
  );

  // FDT
  instances.FDTFactoryInstance = await deployer.deploy(FDTFactory);

  console.log(`
    Deployments:
    
      ANNActor: ${ANNActor.address}
      ANNEncoder: ${ANNEncoder.address}
      ANNEngine: ${ANNEngine.address}
      ANNRegistry: ${ANNRegistry.address}
      CECActor: ${CECActor.address}
      CECEncoder: ${CECEncoder.address}
      CECEngine: ${CECEngine.address}
      CECRegistry: ${CECRegistry.address}
      CEGActor: ${CEGActor.address}
      CEGEncoder: ${CEGEncoder.address}
      CEGEngine: ${CEGEngine.address}
      CEGRegistry: ${CEGRegistry.address}
      Custodian: ${Custodian.address}
      FDTFactory: ${FDTFactory.address}
      MarketObjectRegistry: ${MarketObjectRegistry.address}
      PAMActor: ${PAMActor.address}
      PAMEncoder: ${PAMEncoder.address}
      PAMEngine: ${PAMEngine.address}
      PAMRegistry: ${PAMRegistry.address}
      ScheduleEncoder: ${ScheduleEncoder.address}
      SignedMath: ${SignedMath.address}
      StateEncoder: ${StateEncoder.address}
  `);

  // deploy settlement token (necessary for registering templates on testnets)
  await deployer.deploy(SettlementToken);
  console.log('    Deployed Settlement Token: ' + SettlementToken.address);
  console.log('');

  // update address for ap-chain or goerli deployment
  const deployments = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'deployments.json'), 'utf8'));
  deployments[await web3.eth.net.getId()] = {
    "ANNActor": ANNActor.address,
    "ANNEncoder": ANNEncoder.address,
    "ANNEngine": ANNEngine.address,
    "ANNRegistry": ANNRegistry.address,
    "CECActor": CECActor.address,
    "CECEncoder": CECEncoder.address,
    "CECEngine": CECEngine.address,
    "CECRegistry": CECRegistry.address,
    "CEGActor": CEGActor.address,
    "CEGEncoder": CEGEncoder.address,
    "CEGEngine": CEGEngine.address,
    "CEGRegistry": CEGRegistry.address,
    "Custodian": Custodian.address,
    "FDTFactory": FDTFactory.address,
    "MarketObjectRegistry": MarketObjectRegistry.address,
    "PAMActor": PAMActor.address,
    "PAMEncoder": PAMEncoder.address,
    "PAMEngine": PAMEngine.address,
    "PAMRegistry": PAMRegistry.address,
    "ScheduleEncoder": ScheduleEncoder.address,
    "SignedMath": SignedMath.address,
    "StateEncoder": StateEncoder.address
  }
  fs.writeFileSync(path.resolve(__dirname, '../', 'deployments.json'), JSON.stringify(deployments, null, 2), 'utf8');
};
