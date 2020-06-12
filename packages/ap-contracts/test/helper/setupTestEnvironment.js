const PAMEngine = artifacts.require('PAMEngine');
const ANNEngine = artifacts.require('ANNEngine');
const CEGEngine = artifacts.require('CEGEngine');
const CECEngine = artifacts.require('CECEngine');

const MarketObjectRegistry = artifacts.require('MarketObjectRegistry');
const AssetRegistry = artifacts.require('AssetRegistry')
const AssetActor = artifacts.require('AssetActor');
const AssetIssuer = artifacts.require('AssetIssuer');
const Custodian = artifacts.require('Custodian');
const TokenizationFactory = artifacts.require('TokenizationFactory')

const SettlementToken = artifacts.require('SettlementToken');


async function setupTestEnvironment (accounts) {
  const admin = accounts[0];
  const instances = {};

  PAMEngine.numberFormat = 'String';

  // deploy ACTUS Solidity
  instances.PAMEngineInstance = await PAMEngine.new();
  instances.ANNEngineInstance = await ANNEngine.new();
  instances.CEGEngineInstance = await CEGEngine.new();
  instances.CECEngineInstance = await CECEngine.new();

  // deploy Core
  instances.AssetRegistryInstance = await AssetRegistry.new()
  instances.MarketObjectRegistryInstance = await MarketObjectRegistry.new();
  instances.AssetActorInstance = await AssetActor.new(
    instances.AssetRegistryInstance.address,
    instances.MarketObjectRegistryInstance.address
  );
  instances.CustodianInstance = await Custodian.new(
    instances.AssetActorInstance.address,
    instances.AssetRegistryInstance.address
  );

  // deploy Issuance
  instances.AssetIssuerInstance = await AssetIssuer.new(
    instances.CustodianInstance.address,
    instances.AssetRegistryInstance.address,
    instances.AssetActorInstance.address
  );

  // deploy Tokenization
  instances.TokenizationFactoryInstance = await TokenizationFactory.new(instances.AssetRegistryInstance.address);

  await instances.AssetActorInstance.registerIssuer(instances.AssetIssuerInstance.address);
  await instances.AssetActorInstance.registerIssuer(admin);

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
