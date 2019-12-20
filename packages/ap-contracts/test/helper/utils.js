const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('actus-solidity/test/helper/parser');

const { deriveTemplateId } = require('./orderUtils');

const TemplateTerms = require('./definitions/template-terms.json');
const CustomTerms = require('./definitions/custom-terms.json');


const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
const ZERO_BYTES = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';


function parseTermsToTemplateTerms (terms) {
  const templateTerms = {};

  for (const attribute of TemplateTerms) {
    if (attribute === 'statusDateOffset') {
      templateTerms[attribute] = terms['statusDate'] - terms['contractDealDate'];
      continue;
    }
    if (attribute === 'maturityDateOffset') {
      templateTerms[attribute] = terms['maturityDate'] - terms['contractDealDate'];
      continue;
    }
    templateTerms[attribute] = terms[attribute];
  }

  return templateTerms;
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
    templateTerms: parseTermsToTemplateTerms(terms),
    customTerms: parseTermsToCustomTerms(terms)
  }
}

async function generateTemplateSchedules(engineContractInstance, generatingTerms) {
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

async function registerTemplate(instances, terms) {
  const { generatingTerms, templateTerms } = deriveTerms(terms);
  const templateSchedules = await generateTemplateSchedules(
    getEngineContractInstanceForContractType(instances, terms.contractType),
    generatingTerms
  ); 
  const templateId = deriveTemplateId(templateTerms, templateSchedules);

  await instances.TemplateRegistryInstance.registerTemplate(templateTerms, templateSchedules);

  return templateId;
}

module.exports = {
  convertDatesToOffsets,
  parseTermsToTemplateTerms,
  parseTermsToCustomTerms,
  getEngineContractInstanceForContractType,
  generateTemplateSchedules,
  registerTemplate,
  deriveTerms,
  ZERO_ADDRESS,
  ZERO_BYTES32,
  ZERO_BYTES
}