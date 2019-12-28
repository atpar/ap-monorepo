const ANNEngine = artifacts.require('ANNEngine');
const PAMEngine = artifacts.require('PAMEngine');
const CEGEngine = artifacts.require('CEGEngine');
const CECEngine = artifacts.require('CECEngine');
const SignedMath = artifacts.require('SignedMath');

const MarketObjectRegistry = artifacts.require('MarketObjectRegistry');
const AssetRegistry = artifacts.require('AssetRegistry');
const TemplateRegistry = artifacts.require('TemplateRegistry');

const AssetActor = artifacts.require('AssetActor');
const AssetIssuer = artifacts.require('AssetIssuer');
const Custodian = artifacts.require('Custodian');

const TokenizationFactory = artifacts.require('TokenizationFactory');

const { registerTemplate } = require('../test/helper/utils');

const B3MB = require('../templates/b3mb.json');


module.exports = async (deployer, network, accounts) => {
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
  instances.MarketObjectRegistryInstance = await deployer.deploy(MarketObjectRegistry);
  instances.TemplateRegistryInstance = await deployer.deploy(TemplateRegistry);
  instances.AssetRegistryInstance = await deployer.deploy(
    AssetRegistry,
    TemplateRegistry.address
  );
  instances.AssetActorInstance = await deployer.deploy(
    AssetActor,
    AssetRegistry.address,
    TemplateRegistry.address,
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
    TemplateRegistry.address,
    AssetRegistry.address
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
      PAMEngine: ${PAMEngine.address}
      TemplateRegistry: ${TemplateRegistry.address}
      SignedMath: ${SignedMath.address}
      TokenizationFactory: ${TokenizationFactory.address}
  `);

  // registering standard templates
  const templateId_1 = await registerTemplate(instances, B3MB.terms);
  
  console.log(`
    Templates:
      B3MD: ${templateId_1}
  `);
};
