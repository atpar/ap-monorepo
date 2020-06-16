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

const SettlementToken = artifacts.require('SettlementToken');


async function setupTestEnvironment (accounts) {
  const admin = accounts[0];
  const instances = {};

  // PAMEngine.numberFormat = 'String';

  // ACTUS-Solidity
  instances.PAMEngineInstance = await PAMEngine.new();
  instances.ANNEngineInstance = await ANNEngine.new();
  instances.CEGEngineInstance = await CEGEngine.new();
  instances.CECEngineInstance = await CECEngine.new();

  // Asset Registry
  instances.ANNRegistryInstance = await ANNRegistry.new();
  instances.CECRegistryInstance = await CECRegistry.new();
  instances.CEGRegistryInstance = await CEGRegistry.new();
  instances.PAMRegistryInstance = await PAMRegistry.new();

  // Market Object Registry
  instances.MarketObjectRegistryInstance = await MarketObjectRegistry.new();

  // Asset Actor
  instances.ANNActorInstance = await ANNActor.new(instances.ANNRegistryInstance.address, instances.MarketObjectRegistryInstance.address);
  instances.CECActorInstance = await CECActor.new(instances.CECRegistryInstance.address, instances.MarketObjectRegistryInstance.address);
  instances.CEGActorInstance = await CEGActor.new(instances.CEGRegistryInstance.address, instances.MarketObjectRegistryInstance.address);
  instances.PAMActorInstance = await PAMActor.new(instances.PAMRegistryInstance.address, instances.MarketObjectRegistryInstance.address);

  // Custodian
  instances.CustodianInstance = await Custodian.new(
    instances.CECActorInstance.address,
    instances.CECRegistryInstance.address
  );

  // FDT
  instances.FDTFactoryInstance = await FDTFactory.new();

  await instances.ANNActorInstance.registerIssuer(admin);
  await instances.CECActorInstance.registerIssuer(admin);
  await instances.CEGActorInstance.registerIssuer(admin);
  await instances.PAMActorInstance.registerIssuer(admin);

  return instances;
}

function parseToContractTerms(contract, terms) {
  return require('@atpar/actus-solidity/test/helper/parser').parseTermsFromObject(contract, terms);
}

async function getDefaultTerms () {
  return require('@atpar/actus-solidity/test/helper/tests').getDefaultTestTerms('PAM');
}

function getZeroTerms () {
  return require('./terms/zero-terms.json');
}

function getComplexTerms () {
  return require('./terms/complex-terms.json');
}

async function deployPaymentToken(owner, holders) {
  const PaymentTokenInstance = await SettlementToken.new({ from: owner });

  for (holder of holders) {
    await PaymentTokenInstance.transfer(holder, web3.utils.toWei('5000'), { from: owner });
  }

  return PaymentTokenInstance;
}

module.exports = {
  setupTestEnvironment,
  parseToContractTerms,
  getDefaultTerms,
  getZeroTerms,
  getComplexTerms,
  deployPaymentToken
};
