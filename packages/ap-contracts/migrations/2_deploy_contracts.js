const fs = require('fs');
const path = require('path');

const ANNEngine = artifacts.require('ANNEngine');
const PAMEngine = artifacts.require('PAMEngine');
const CEGEngine = artifacts.require('CEGEngine');
const CECEngine = artifacts.require('CECEngine');
const SignedMath = artifacts.require('SignedMath');
const MarketObjectRegistry = artifacts.require('MarketObjectRegistry');
const PAMEncoder = artifacts.require('PAMEncoder');
const StateEncoder = artifacts.require('StateEncoder');
const ScheduleEncoder = artifacts.require('ScheduleEncoder');
const AssetRegistry = artifacts.require('AssetRegistry');
const AssetActor = artifacts.require('AssetActor');
const AssetIssuer = artifacts.require('AssetIssuer');
const Custodian = artifacts.require('Custodian');
const TokenizationFactory = artifacts.require('TokenizationFactory');
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

  // Core
  instances.PAMEncoderInstance = await deployer.deploy(PAMEncoder);
  await deployer.link(PAMEncoder, AssetRegistry);
  instances.StateEncoderInstance = await deployer.deploy(StateEncoder);
  await deployer.link(StateEncoder, AssetRegistry);
  instances.ScheduleEncoderInstance = await deployer.deploy(ScheduleEncoder);
  await deployer.link(ScheduleEncoder, AssetRegistry);
  instances.AssetRegistryInstance = await deployer.deploy(AssetRegistry);
  
  instances.MarketObjectRegistryInstance = await deployer.deploy(MarketObjectRegistry);
  instances.AssetActorInstance = await deployer.deploy(
    AssetActor,
    AssetRegistry.address,
    MarketObjectRegistry.address
  );
  instances.CustodianInstance = await deployer.deploy(
    Custodian,
    AssetActor.address,
    AssetRegistry.address
  );

  // Issuance
  instances.AssetIssuerInstance = await deployer.deploy(
    AssetIssuer,
    Custodian.address,
    AssetRegistry.address,
    AssetActor.address
  );

  // Tokenization
  instances.TokenizationFactoryInstance = await deployer.deploy(
    TokenizationFactory,
    AssetRegistry.address
  );

  await instances.AssetActorInstance.registerIssuer(AssetIssuer.address);

  console.log(`
    Deployments:
    
      ANNEngine: ${ANNEngine.address}
      AssetActor: ${AssetActor.address}
      AssetIssuer: ${AssetIssuer.address}
      AssetRegistry: ${AssetRegistry.address}
      CECEngine: ${CECEngine.address}
      CEGEngine: ${CEGEngine.address}
      Custodian: ${Custodian.address}
      MarketObjectRegistry: ${MarketObjectRegistry.address}
      PAMEncoder: ${PAMEncoder.address}
      PAMEngine: ${PAMEngine.address}
      ScheduleEncoder: ${ScheduleEncoder.address}
      SignedMath: ${SignedMath.address}
      StateEncoder: ${StateEncoder.address}
      TokenizationFactory: ${TokenizationFactory.address}
  `);

  // deploy settlement token (necessary for registering templates on testnets)
  await deployer.deploy(SettlementToken);
  console.log('    Deployed Settlement Token: ' + SettlementToken.address);
  console.log('');

  // update address for ap-chain or goerli deployment
  const deployments = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', 'deployments.json'), 'utf8'));
  deployments[await web3.eth.net.getId()] = {
    "ANNEngine": ANNEngine.address,
    "AssetActor": AssetActor.address,
    "AssetIssuer": AssetIssuer.address,
    "AssetRegistry": AssetRegistry.address,
    "CECEngine": CECEngine.address,
    "CEGEngine": CEGEngine.address,
    "Custodian": Custodian.address,
    "MarketObjectRegistry": MarketObjectRegistry.address,
    "PAMEncoder": PAMEncoder.address,
    "PAMEngine": PAMEngine.address,
    "ScheduleEncoder": ScheduleEncoder.address,
    "SignedMath": SignedMath.address,
    "StateEncoder": StateEncoder.address,
    "TokenizationFactory": TokenizationFactory.address
  }
  fs.writeFileSync(path.resolve(__dirname, '../', 'deployments.json'), JSON.stringify(deployments, null, 2), 'utf8');
};
