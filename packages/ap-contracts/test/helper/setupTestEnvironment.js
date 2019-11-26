const PAMEngine = artifacts.require('PAMEngine');
const ANNEngine = artifacts.require('ANNEngine');
const CEGEngine = artifacts.require('CEGEngine');
const CECEngine = artifacts.require('CECEngine');

const MarketObjectRegistry = artifacts.require('MarketObjectRegistry');
const AssetRegistry = artifacts.require('AssetRegistry')
const AssetActor = artifacts.require('AssetActor');
const AssetIssuer = artifacts.require('AssetIssuer');
const Custodian = artifacts.require('Custodian');
const ProductRegistry = artifacts.require('ProductRegistry');
const TokenizationFactory = artifacts.require('TokenizationFactory')

const ProductTerms = require('./product-terms.json');
const CustomTerms = require('./custom-terms.json');


async function setupTestEnvironment () {
  const instances = {};

  PAMEngine.numberFormat = 'String';

  // deploy ACTUS Solidity
  instances.PAMEngineInstance = await PAMEngine.new();
  instances.ANNEngineInstance = await ANNEngine.new();
  instances.CEGEngineInstance = await CEGEngine.new();
  instances.CECEngineInstance = await CECEngine.new();
  
  // deploy Core
  instances.MarketObjectRegistryInstance = await MarketObjectRegistry.new();
  instances.ProductRegistryInstance = await ProductRegistry.new();
  instances.AssetRegistryInstance = await AssetRegistry.new(
    instances.ProductRegistryInstance.address
  );
  instances.AssetActorInstance = await AssetActor.new(
    instances.AssetRegistryInstance.address,
    instances.ProductRegistryInstance.address,
    instances.MarketObjectRegistryInstance.address
  );
  instances.CustodianInstance = await Custodian.new(
    instances.AssetActorInstance.address
  );

  // deploy Issuance
  instances.AssetIssuerInstance = await AssetIssuer.new(
    instances.CustodianInstance.address,
    instances.ProductRegistryInstance.address
  );

  // deploy Tokenization
  instances.TokenizationFactoryInstance = await TokenizationFactory.new(
    instances.AssetRegistryInstance.address
  );

  await instances.AssetActorInstance.registerIssuer(instances.AssetIssuerInstance.address);

  return instances;
}

function getDefaultTerms () {
  return require('actus-solidity/test/helper/tests').getDefaultTestTerms('PAM');
}

function parseTermsToProductTerms (terms) {
  const productTerms = {};

  for (const attribute of ProductTerms) {
    if (attribute === 'statusDateOffset') {
      productTerms[attribute] = terms['statusDate'] - terms['contractDealDate'];
      continue;
    }
    if (attribute === 'maturityDateOffset') {
      productTerms[attribute] = terms['maturityDate'] - terms['contractDealDate'];
      continue;
    }
    productTerms[attribute] = terms[attribute];
  }

  return productTerms;
}

function parseTermsToCustomTerms (terms) {
  const customTerms = {};

  for (const attribute of CustomTerms) {
    if (attribute === 'anchorDate') {
      customTerms[attribute] = terms['contractDealDate'];
      continue;
    }

    customTerms[attribute] = terms[attribute];
  }

  return customTerms;
}

function convertDatesToOffsets (terms) {
  const anchorDate = terms.contractDealDate;

  terms.contractDealDate = 0;
  terms.statusDate = 0;
  terms.initialExchangeDate -= (terms.initialExchangeDate > 0) ? anchorDate : 0; 
  terms.maturityDate -= (terms.maturityDate > 0) ? anchorDate : 0;
  terms.terminationDate -= (terms.terminationDate > 0) ? anchorDate : 0;
  terms.purchaseDate -= (terms.purchaseDate > 0) ? anchorDate : 0;
  terms.capitalizationEndDate -= (terms.capitalizationEndDate > 0) ? anchorDate : 0;
  terms.cycleAnchorDateOfInterestPayment -= (terms.cycleAnchorDateOfInterestPayment > 0) ? anchorDate : 0;
  terms.cycleAnchorDateOfRateReset -= (terms.cycleAnchorDateOfRateReset > 0) ? anchorDate : 0;
  terms.cycleAnchorDateOfScalingIndex -= (terms.cycleAnchorDateOfScalingIndex > 0) ? anchorDate : 0;
  terms.cycleAnchorDateOfFee -= (terms.cycleAnchorDateOfFee > 0) ? anchorDate : 0;
  terms.cycleAnchorDateOfPrincipalRedemption -= (terms.cycleAnchorDateOfPrincipalRedemption > 0) ? anchorDate : 0;

  return terms;
}

module.exports = {
  setupTestEnvironment,
  getDefaultTerms,
  convertDatesToOffsets,
  parseTermsToProductTerms,
  parseTermsToCustomTerms
};
