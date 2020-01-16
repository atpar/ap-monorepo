const fs = require('fs');
const path = require('path');

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
const TestToken = artifacts.require('TestToken');

const { registerTemplate } = require('../test/helper/utils');


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

  // deploy test token (necessary for registering templates on testnets)
  await deployer.deploy(TestToken);
  console.log('    Deployed test token: ' + TestToken.address);
  console.log('');

  // registering standard templates (skip for local)
  const pathToTemplates = (network === 'ap-chain')
    ? '../templates/ap-chain/'
    : (network === 'goerli')
      ? '../templates/goerli/'
      : null;

  if (!pathToTemplates) { return; } 

  console.log('    Registering standard templates on network \'' + network + '\':');
  console.log('');

  for (const templateFileName of fs.readdirSync(path.resolve(__dirname, pathToTemplates))) {
    if (!templateFileName.includes('.json')) { continue; }
    const template = JSON.parse(fs.readFileSync(path.resolve(__dirname, pathToTemplates, templateFileName), 'utf8'));
    template.extendedTemplateTerms.currency = TestToken.address;
    template.templateId = await registerTemplate(instances, template);
    console.log('      ' + template.name + ': ' + template.templateId);
    fs.writeFileSync(path.resolve(__dirname, pathToTemplates, templateFileName), JSON.stringify(template, null, 4), 'utf8');
  }

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
    "PAMEngine": PAMEngine.address,
    "TemplateRegistry": TemplateRegistry.address,
    "SignedMath": SignedMath.address,
    "TokenizationFactory": TokenizationFactory.address
  }
  fs.writeFileSync(path.resolve(__dirname, '../', 'deployments.json'), JSON.stringify(deployments, null, 2), 'utf8');
};
