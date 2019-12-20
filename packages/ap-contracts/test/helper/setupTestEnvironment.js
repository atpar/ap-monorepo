const PAMEngine = artifacts.require('PAMEngine');
const ANNEngine = artifacts.require('ANNEngine');
const CEGEngine = artifacts.require('CEGEngine');
const CECEngine = artifacts.require('CECEngine');

const MarketObjectRegistry = artifacts.require('MarketObjectRegistry');
const AssetRegistry = artifacts.require('AssetRegistry')
const AssetActor = artifacts.require('AssetActor');
const AssetIssuer = artifacts.require('AssetIssuer');
const Custodian = artifacts.require('Custodian');
const TemplateRegistry = artifacts.require('TemplateRegistry');
const TokenizationFactory = artifacts.require('TokenizationFactory')

const ERC20SampleToken = artifacts.require('ERC20SampleToken');


async function setupTestEnvironment (accounts) {
  const admin = accounts[0];
  const instances = {};

  PAMEngine.numberFormat = 'String';

  // deploy ACTUS Solidity
  instances.PAMEngineInstance = await PAMEngine.deployed();// new();
  instances.ANNEngineInstance = await ANNEngine.deployed();// new();
  instances.CEGEngineInstance = await CEGEngine.deployed();// new();
  instances.CECEngineInstance = await CECEngine.deployed();// new();
  
  // deploy Core
  instances.MarketObjectRegistryInstance = await MarketObjectRegistry.deployed(); // new();
  instances.TemplateRegistryInstance = await TemplateRegistry.deployed(); // new();
  instances.AssetRegistryInstance = await AssetRegistry.deployed() // new(
    // instances.TemplateRegistryInstance.address
  // );
  instances.AssetActorInstance = await AssetActor.deployed(); // new(
    // instances.AssetRegistryInstance.address,
    // instances.TemplateRegistryInstance.address,
    // instances.MarketObjectRegistryInstance.address
  // );
  instances.CustodianInstance = await Custodian.deployed(); // new(
  //   instances.AssetActorInstance.address,
  //   instances.AssetRegistryInstance.address
  // );

  // deploy Issuance
  instances.AssetIssuerInstance = await AssetIssuer.deployed(); // new(
  //   instances.CustodianInstance.address,
  //   instances.TemplateRegistryInstance.address,
  //   instances.AssetRegistryInstance.address
  // );

  // deploy Tokenization
  instances.TokenizationFactoryInstance = await TokenizationFactory.deployed(); // new(
    // instances.AssetRegistryInstance.address
  // );

  await instances.AssetActorInstance.registerIssuer(instances.AssetIssuerInstance.address);
  await instances.AssetActorInstance.registerIssuer(admin);

  return instances;
}

function getDefaultTerms () {
  return require('actus-solidity/test/helper/tests').getDefaultTestTerms('PAM');
}

async function deployPaymentToken(owner, holders) {
  const PaymentTokenInstance = await ERC20SampleToken.new({ from: owner });

  for (holder of holders) {
    await PaymentTokenInstance.transfer(holder, web3.utils.toWei('5000'), { from: owner });
  }

  return PaymentTokenInstance;
}

module.exports = {
  setupTestEnvironment,
  getDefaultTerms,
  deployPaymentToken
};
