/* global artifacts, buidlerArguments, web3 */
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
const VanillaUpgradeSafeFDT = artifacts.require('VanillaUpgradeSafeFDT');
const SimpleRestrictedUpgradeSafeFDT = artifacts.require('SimpleRestrictedUpgradeSafeFDT');

const SettlementToken = artifacts.require('SettlementToken');


async function setupTestEnvironment (accounts) {
  const admin = accounts[0];
  const instances = {};

  // If it runs by Buidler (rather than Truffle)
  const isBuidler = typeof buidlerArguments === 'object';

  // PAMEngine.numberFormat = 'String';

  // ACTUS-Solidity
  instances.ANNEngineInstance = await ANNEngine.new();
  instances.CECEngineInstance = await CECEngine.new();
  instances.CEGEngineInstance = await CEGEngine.new();
  instances.CERTFEngineInstance = await CERTFEngine.new();
  instances.PAMEngineInstance = await PAMEngine.new();
    if (isBuidler) {
        ANNEngine.setAsDeployed(instances.ANNEngineInstance);
        CECEngine.setAsDeployed(instances.CECEngineInstance);
        CEGEngine.setAsDeployed(instances.CEGEngineInstance);
        CERTFEngine.setAsDeployed(instances.CERTFEngineInstance);
        PAMEngine.setAsDeployed(instances.PAMEngineInstance);
    }

  // Asset Registry
  instances.ANNEncoderInstance = await ANNEncoder.new();
  instances.CECEncoderInstance = await CECEncoder.new();
  instances.CEGEncoderInstance = await CEGEncoder.new();
  instances.CERTFEncoderInstance = await CERTFEncoder.new();
  instances.PAMEncoderInstance = await PAMEncoder.new();
  try { await ANNRegistry.link(instances.ANNEncoderInstance); } catch(error) {}
  try { await CECRegistry.link(instances.CECEncoderInstance); } catch(error) {}
  try { await CEGRegistry.link(instances.CEGEncoderInstance); } catch(error) {}
  try { await CERTFRegistry.link(instances.CERTFEncoderInstance); } catch(error) {}
  try { await PAMRegistry.link(instances.PAMEncoderInstance); } catch(error) {}
  instances.ANNRegistryInstance = await ANNRegistry.new();
  instances.CECRegistryInstance = await CECRegistry.new();
  instances.CEGRegistryInstance = await CEGRegistry.new();
  instances.CERTFRegistryInstance = await CERTFRegistry.new();
  instances.PAMRegistryInstance = await PAMRegistry.new();
  if (isBuidler) {
    ANNEncoder.setAsDeployed(instances.ANNEncoderInstance);
    CECEncoder.setAsDeployed(instances.CECEncoderInstance);
    CEGEncoder.setAsDeployed(instances.CEGEncoderInstance);
    CERTFEncoder.setAsDeployed(instances.CERTFEncoderInstance);
    PAMEncoder.setAsDeployed(instances.PAMEncoderInstance);
    ANNRegistry.setAsDeployed(instances.ANNRegistryInstance);
    CECRegistry.setAsDeployed(instances.CECRegistryInstance);
    CEGRegistry.setAsDeployed(instances.CEGRegistryInstance);
    CERTFRegistry.setAsDeployed(instances.CERTFRegistryInstance);
    PAMRegistry.setAsDeployed(instances.PAMRegistryInstance);
  }

  // Data Registry
  instances.DataRegistryInstance = await DataRegistry.new();
  if (isBuidler) {
      DataRegistry.setAsDeployed(instances.DataRegistryInstance);
  }

  // Asset Actor
  instances.ANNActorInstance = await ANNActor.new(instances.ANNRegistryInstance.address, instances.DataRegistryInstance.address);
  instances.CECActorInstance = await CECActor.new(instances.CECRegistryInstance.address, instances.DataRegistryInstance.address);
  instances.CEGActorInstance = await CEGActor.new(instances.CEGRegistryInstance.address, instances.DataRegistryInstance.address);
  instances.CERTFActorInstance = await CERTFActor.new(instances.CERTFRegistryInstance.address, instances.DataRegistryInstance.address);
  instances.PAMActorInstance = await PAMActor.new(instances.PAMRegistryInstance.address, instances.DataRegistryInstance.address);
  if (isBuidler) {
    ANNActor.setAsDeployed(instances.ANNActorInstance);
    CECActor.setAsDeployed(instances.CECActorInstance);
    CEGActor.setAsDeployed(instances.CEGActorInstance);
    CERTFActor.setAsDeployed(instances.CERTFActorInstance);
    PAMActor.setAsDeployed(instances.PAMActorInstance);
  }

  // Custodian
  instances.CustodianInstance = await Custodian.new(
    instances.CECActorInstance.address,
    instances.CECRegistryInstance.address
  );
  if (isBuidler) {
    Custodian.setAsDeployed(instances.CustodianInstance);
  }

  // FDT
  instances.VanillaUpgradeSafeFDTInstance = await VanillaUpgradeSafeFDT.new();
  instances.SimpleRestrictedUpgradeSafeFDTInstance = await SimpleRestrictedUpgradeSafeFDT.new();
  if (isBuidler) {
    VanillaUpgradeSafeFDT.setAsDeployed(instances.VanillaUpgradeSafeFDTInstance);
    SimpleRestrictedUpgradeSafeFDT.setAsDeployed(instances.SimpleRestrictedUpgradeSafeFDTInstance);
    // FIXME: Work around Buidler "linking by name unsupported" (for FDTFactory)
    // Error: Linking contracts by name is not supported by Buidler. Please use FDTFactory.link(libraryInstance) instead
    // await FDTFactory.link('VanillaFDTLogic', instances.VanillaUpgradeSafeFDTInstance.address);
    // await FDTFactory.link('SimpleRestrictedFDTLogic', instances.SimpleRestrictedUpgradeSafeFDTInstance.address);
    // FDTFactory.setAsDeployed(instances.FDTFactoryInstance);
  } else {
    await FDTFactory.link('VanillaFDTLogic', instances.VanillaUpgradeSafeFDTInstance.address);
    await FDTFactory.link('SimpleRestrictedFDTLogic', instances.SimpleRestrictedUpgradeSafeFDTInstance.address);
    instances.FDTFactoryInstance = await FDTFactory.new();
  }

  await instances.ANNActorInstance.registerIssuer(admin);
  await instances.CECActorInstance.registerIssuer(admin);
  await instances.CEGActorInstance.registerIssuer(admin);
  await instances.CERTFActorInstance.registerIssuer(admin);
  await instances.PAMActorInstance.registerIssuer(admin);

  return instances;
}

function parseToContractTerms(contract, terms) {
  return require('@atpar/actus-solidity/test/helper/parser').parseTermsFromObject(contract, terms);
}

async function getDefaultTerms (contract) {
  return require('@atpar/actus-solidity/test/helper/tests').getDefaultTestTerms(contract);
}

function getZeroTerms () {
  return require('./terms/zero-terms.json');
}

function getComplexTerms () {
  return require('./terms/complex-terms.json');
}

async function deployPaymentToken(owner, holders) {
  const PaymentTokenInstance = await SettlementToken.new({ from: owner });

  for (let holder of holders) {
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
