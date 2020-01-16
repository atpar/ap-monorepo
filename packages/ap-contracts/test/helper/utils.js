const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('@atpar/actus-solidity/test/helper/parser');

const { deriveTemplateId } = require('./orderUtils');

const TemplateTerms = require('./definitions/TemplateTerms.json');
const CustomTerms = require('./definitions/CustomTerms.json');
const GeneratingTerms = require('./definitions/GeneratingTerms.json');


const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
const ZERO_BYTES = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
const ZERO_OFFSET = '1'; // '0xFFFFFFFFFFFFFFFF';


function normalizeDate (anchorDate, date) {
  // not set date value, do not normalize
  if (Number(date) === 0) { return 0; }
  
  const normalizedDate = Number(date) - Number(anchorDate);
  // anchorDate is greater than date to normalize
  if (normalizedDate < 0) { throw new Error('Normalized date is negative'); } 
  // date value is set, set to ZERO_OFFSET to indicate that value is set
  if (normalizedDate === 0) { return ZERO_OFFSET; }

  return normalizedDate;
}

function parseTermsToTemplateTerms (terms) {
  const templateTerms = {};

  for (const attribute of TemplateTerms) {
    if (attribute === 'statusDateOffset') {
      templateTerms[attribute] = normalizeDate(terms['contractDealDate'], terms['statusDate']);
      continue;
    }
    if (attribute === 'maturityDateOffset') {
      templateTerms[attribute] = normalizeDate(terms['contractDealDate'], terms['maturityDate']);
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
      // define anchor date as contract deal date
      customTerms[attribute] = terms['contractDealDate'];
      continue;
    }

    customTerms[attribute] = terms[attribute];
  }

  return customTerms;
}

function parseExtendedTemplateTermsToTemplateTerms (extendedTemplateTerms) {
  const templateTerms = {};

  for (const attribute of TemplateTerms) {
    templateTerms[attribute] = extendedTemplateTerms[attribute];
  }

  return templateTerms;
}

function deriveGeneratingTermsFromExtendedTemplateTerms (extendedTemplateTerms) {
  const generatingTerms = {};

  for (const attribute of GeneratingTerms) {
    // translate Terms attributes to ExtendedTemplateTerms attributes (e.g. postfix 'Offset')
    const extendedTemplateTermsAttribute = Object.keys(extendedTemplateTerms).find((attr) => attr.includes(attribute));
    generatingTerms[attribute] = extendedTemplateTerms[extendedTemplateTermsAttribute];
  }

  return generatingTerms;
}

function normalizeDates (terms) {
  const anchorDate = terms.contractDealDate;

  terms.contractDealDate = normalizeDate(anchorDate, terms.contractDealDate);
  terms.statusDate = normalizeDate(anchorDate, terms.statusDate);
  terms.initialExchangeDate = normalizeDate(anchorDate, terms.initialExchangeDate); 
  terms.maturityDate = normalizeDate(anchorDate, terms.maturityDate);
  terms.terminationDate = normalizeDate(anchorDate, terms.terminationDate);
  terms.purchaseDate = normalizeDate(anchorDate, terms.purchaseDate);
  terms.capitalizationEndDate = normalizeDate(anchorDate, terms.capitalizationEndDate);
  terms.cycleAnchorDateOfInterestPayment = normalizeDate(anchorDate, terms.cycleAnchorDateOfInterestPayment);
  terms.cycleAnchorDateOfRateReset = normalizeDate(anchorDate, terms.cycleAnchorDateOfRateReset);
  terms.cycleAnchorDateOfScalingIndex = normalizeDate(anchorDate, terms.cycleAnchorDateOfScalingIndex);
  terms.cycleAnchorDateOfFee = normalizeDate(anchorDate, terms.cycleAnchorDateOfFee);
  terms.cycleAnchorDateOfPrincipalRedemption = normalizeDate(anchorDate, terms.cycleAnchorDateOfPrincipalRedemption);

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
    // normalize dates for generating TemplateSchedules
    generatingTerms: normalizeDates(parseTermsToGeneratingTerms(terms)),
    templateTerms: parseTermsToTemplateTerms(terms),
    customTerms: parseTermsToCustomTerms(terms)
  }
}

async function generateTemplateSchedules(engineContractInstance, generatingTerms) {
  return {
    nonCyclicSchedule: await engineContractInstance.computeNonCyclicScheduleSegment(generatingTerms, 0, generatingTerms.maturityDate),
    cyclicIPSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, 0, generatingTerms.maturityDate, 8),
    cyclicPRSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, 0, generatingTerms.maturityDate, 15),
    cyclicSCSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, 0, generatingTerms.maturityDate, 19),
    cyclicRRSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, 0, generatingTerms.maturityDate, 18),
    cyclicFPSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, 0, generatingTerms.maturityDate, 4),
    cyclicPYSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, 0, generatingTerms.maturityDate, 11),
  };
}

// used for registering templates after migrations
async function registerTemplate(instances, template) {
  const templateTerms = parseExtendedTemplateTermsToTemplateTerms(template.extendedTemplateTerms);
  const generatingTerms = deriveGeneratingTermsFromExtendedTemplateTerms(template.extendedTemplateTerms);
  const templateSchedules = await generateTemplateSchedules(
    getEngineContractInstanceForContractType(instances, template.extendedTemplateTerms.contractType),
    generatingTerms
  );

  await instances.TemplateRegistryInstance.registerTemplate(templateTerms, templateSchedules);
  const templateId = deriveTemplateId(templateTerms, templateSchedules); // tx.logs[0].args.templateId;

  return templateId;
}

// used in test cases
// todo: refactor test cases such that we provide templates instead of a terms object such that
// this method is not needed anymore
async function registerTemplateFromTerms(instances, terms) {
  const { generatingTerms, templateTerms } = deriveTerms(terms);
  const templateSchedules = await generateTemplateSchedules(
    getEngineContractInstanceForContractType(instances, terms.contractType),
    generatingTerms
  );

  await instances.TemplateRegistryInstance.registerTemplate(templateTerms, templateSchedules);
  const templateId = deriveTemplateId(templateTerms, templateSchedules); // tx.logs[0].args.templateId;

  return templateId;
}

function removeNullEvents (events) {
  const compactEvents = [];

  for (const event of events) {
    if (event === ZERO_BYTES32) { continue; }
    compactEvents.push(event);
  }

  return compactEvents;
}

module.exports = {
  normalizeDates,
  parseTermsToTemplateTerms,
  parseTermsToCustomTerms,
  getEngineContractInstanceForContractType,
  generateTemplateSchedules,
  registerTemplate,
  registerTemplateFromTerms,
  deriveTerms,
  removeNullEvents,
  ZERO_ADDRESS,
  ZERO_BYTES32,
  ZERO_BYTES
}
