const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('actus-solidity/test/helper/parser');

const { deriveProductId } = require('./orderUtils');

const ProductTerms = require('./definitions/product-terms.json');
const CustomTerms = require('./definitions/custom-terms.json');


const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
const ZERO_BYTES = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';


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

function getEngineContractInstanceForContractType(instances, contractType) {
  if (contractType === 0) {
    return instances.PAMEngineInstance;
  } else if (contractType === 1) {
    return instances.ANNEngineInstance;
  } else if (contractType === 16) {
    return instances.CEGEngineInstance;
  } else if (contractType === 17) {
    return instances.CECEngineInstance;
  } else {
    throw new Error('Contract Type not supported.');
  }
}

function deriveTerms(terms) {
  return {
    lifecycleTerms: parseTermsToLifecycleTerms(terms),
    generatingTerms: convertDatesToOffsets(parseTermsToGeneratingTerms(terms)),
    productTerms: parseTermsToProductTerms(terms),
    customTerms: parseTermsToCustomTerms(terms)
  }
}

async function generateProductSchedules(engineContractInstance, generatingTerms) {
  return {
    nonCyclicSchedule: await engineContractInstance.computeNonCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate),
    cyclicIPSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 8),
    cyclicPRSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 15),
    cyclicSCSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 19),
    cyclicRRSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 18),
    cyclicFPSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 4),
    cyclicPYSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 11),
  };
}

async function registerProduct(instances, terms) {
  const { generatingTerms, productTerms } = deriveTerms(terms);
  const productSchedules = await generateProductSchedules(
    getEngineContractInstanceForContractType(instances, terms.contractType),
    generatingTerms
  ); 
  const productId = deriveProductId(productTerms, productSchedules);

  await instances.ProductRegistryInstance.registerProduct(productTerms, productSchedules);

  return productId;
}

module.exports = {
  convertDatesToOffsets,
  parseTermsToProductTerms,
  parseTermsToCustomTerms,
  getEngineContractInstanceForContractType,
  generateProductSchedules,
  registerProduct,
  deriveTerms,
  ZERO_ADDRESS,
  ZERO_BYTES32,
  ZERO_BYTES
}