const web3Utils = require('web3-utils');
const BigNumber = require('bignumber.js');

const ACTUS_DICTIONARY = require('actus-dictionary/actus-dictionary.json');

const ANN_TERMS = require('./definitions/ANNTerms.json');
const CEC_TERMS = require('./definitions/CECTerms.json');
const CEG_TERMS = require('./definitions/CEGTerms.json');
const CERTF_TERMS = require('./definitions/CERTFTerms.json');
const PAM_TERMS = require('./definitions/PAMTerms.json');

const PRECISION = 18; // solidity precision


const isoToUnix = (date) => {
  return (new Date(date + 'Z')).getTime() / 1000;
}

const unixToISO = (unix) => {
  return new Date(unix * 1000).toISOString();
}

const toHex = (value) => {  
  return web3Utils.asciiToHex(value);
}

const getIndexOfAttribute = (attribute, value) => {
  if (ACTUS_DICTIONARY.terms[attribute] == undefined) { throw new Error('Unknown attribute provided.')}
  const allowedValues = ACTUS_DICTIONARY.terms[attribute].allowedValues.find((allowedValue) => allowedValue.acronym === value);
  if (allowedValues == undefined) { console.log(attribute); throw new Error('No index found for attribute.'); }

  return Number(allowedValues.option);
}

const getIndexForContractReferenceAttribute = (attribute, value) => {
  if (ACTUS_DICTIONARY.contractReference[attribute] == undefined) { throw new Error('Unknown attribute provided.')}
  const allowedValues = ACTUS_DICTIONARY.contractReference[attribute].allowedValues.find((allowedValue) => allowedValue.acronym === value);
  if (allowedValues == undefined) { console.log(attribute); throw new Error('No index found for attribute.'); }

  return Number(allowedValues.option);
}

const getIndexForEventType = (eventType) => {
  if (eventType === 'AD') return 0;

  const event = Object.values(ACTUS_DICTIONARY.event.eventType.allowedValues).find((event) => event.acronym === eventType);
  if (event == undefined) { console.log(eventType); throw new Error('Unknown event type provided.'); }

  return event.sequence;
}

const toPrecision = (value) => {
  return (new BigNumber(value).shiftedBy(PRECISION)).toFixed();
}

const fromPrecision = (value) => {
  return (new BigNumber(value).shiftedBy(-PRECISION).toNumber());
}

const roundToDecimals = (value, decimals) => {
  decimals = (decimals > 2) ? (decimals - 2) : decimals;
  // console.log(value, decimals, numberOfDecimals(value));
 
  const roundedValue = Number(BigNumber(value).decimalPlaces(decimals));
  const decimalDiff = decimals - numberOfDecimals(roundedValue);

  if (decimalDiff > 0) {
    // return Number(String(value).substring(0, String(value).length - (numberOfDecimals(value) - decimals)));  
    return Number(value.toFixed(decimals));
  }

  return roundedValue; 
}

const numberOfDecimals = (number) => {
  return (String(number).split('.')[1] || []).length;
}

const parseCycleToIPS = (cycle) => {
  if (!cycle || cycle === '') { return { i: 0, p: 0, s: 0, isSet: false }; }

  const pOptions = ['D', 'W', 'M', 'Q', 'H', 'Y'];

  let i = String(cycle).slice(0, -2);
  let p = pOptions.indexOf(String(cycle).slice(-2, -1));
  let s = (String(cycle).slice(-1) === '+') ? 0 : 1;

  return { i: i, p: p, s: s, isSet: true };
}

const parsePeriodToIP = (period) => {
  if (!period  || period === '') { return { i: 0, p: 0, isSet: false }; }

  const pOptions = ['D', 'W', 'M', 'Q', 'H', 'Y'];

  let i = String(period).slice(0, -1);
  let p = pOptions.indexOf(String(period).slice(-1));

  return { i: i, p: p, isSet: true };
}

const parseAttributeValue = (attribute, value) => {
  if (attribute === 'contractReference_1') {
    if (value && value.length > 0 && value[0].object && value[0].type && value[0].role) {
      return {
        object: toHex(value[0].object),
        object2: toHex(''),
        _type: getIndexForContractReferenceAttribute('type', value[0].type),
        role: getIndexForContractReferenceAttribute('role', value[0].role)
      };  
    }
    return { object: toHex(''), object2: toHex(''), _type: 0, role: 0 };
  }
  if (attribute === 'contractReference_2') {
    if (value && value.length > 1 && value[1].object && value[1].type && value[1].role) {
      return {
        object: toHex(value[1].object),
        object2: toHex(''),
        _type: getIndexForContractReferenceAttribute('type', value[1].type),
        role: getIndexForContractReferenceAttribute('role', value[1].role)
      };  
    }
    return { object: toHex(''), object2: toHex(''), _type: 0, role: 0 };
  } else if (attribute === 'currency' || attribute === 'settlementCurrency') {
    return '0x0000000000000000000000000000000000000000';
  } else if (ACTUS_DICTIONARY.terms[attribute].type === 'Enum' || ACTUS_DICTIONARY.terms[attribute].type === 'Enum[]') {
    return (value) ? getIndexOfAttribute(attribute, value) : 0;
  } else if (ACTUS_DICTIONARY.terms[attribute].type === 'Varchar') {
    return toHex((value) ? value : '');
  } else if (ACTUS_DICTIONARY.terms[attribute].type === 'Real') {
    return (value) ? toPrecision(value) : 0;
  } else if (ACTUS_DICTIONARY.terms[attribute].type === 'Timestamp') {
    return (value) ? isoToUnix(value) : 0;
  } else if (ACTUS_DICTIONARY.terms[attribute].type === 'Cycle') {
    return parseCycleToIPS(value);
  } else if (ACTUS_DICTIONARY.terms[attribute].type === 'Period') {
    return parsePeriodToIP(value);
  } 

  return undefined;
}

const parseResultsFromObject = (schedule) => {  
  const parsedResults = [];

  for (const event of schedule) {
    const eventTypeIndex = getIndexForEventType(event.eventType);

    if (eventTypeIndex === 0) { continue; } // filter out AD events
    const result = { ...event };

    if (result.eventDate !== undefined) result.eventDate = new Date(result.eventDate + 'Z').toISOString();
    if (result.eventType !== undefined) result.eventType = Number(eventTypeIndex).toString();
    if (result.contractPerformance !== undefined) result.contractPerformance = getIndexOfAttribute('contractPerformance', result.contractPerformance).toString();
    if (result.payoff !== undefined) result.eventValue = result.payoff; delete result.payoff;
    if (result.quantity !== undefined) result.quantity = Number(result.quantity);
    if (result.statusDate !== undefined) result.statusDate = new Date(result.statusDate + 'Z').toISOString();
    if (result.accruedInterest !== undefined) result.accruedInterest = Number(result.accruedInterest);
    if (result.nominalInterestRate !== undefined) result.nominalInterestRate = Number(result.nominalInterestRate);
    if (result.notionalPrincipal !== undefined) result.notionalPrincipal = Number(result.notionalPrincipal);

    parsedResults.push(result)
  }

  return parsedResults;
}

function parseToTestEvent (eventType, eventTime, payoff, state) {
  return {
    eventDate: unixToISO(eventTime),
    eventType: String(eventType),
    eventValue: fromPrecision(payoff),
    notionalPrincipal: fromPrecision(state.notionalPrincipal),
    nominalInterestRate: fromPrecision(state.nominalInterestRate),
    accruedInterest: fromPrecision(state.accruedInterest),
  };
}

function parseToTestEventCERTF (eventType, eventTime, payoff, state) {
  return {
    eventDate: unixToISO(eventTime),
    eventType: String(eventType),
    eventValue: fromPrecision(payoff),
    quantity: fromPrecision(state.quantity),
    exerciseAmount: fromPrecision(state.exerciseAmount),
    exerciseQuantity: fromPrecision(state.exerciseQuantity),
    marginFactor: fromPrecision(state.marginFactor),
    adjustmentFactor: fromPrecision(state.adjustmentFactor),
    couponAmountFixed: fromPrecision(state.couponAmountFixed),
    contractPerformance: String(state.contractPerformance),
    statusDate: unixToISO(state.statusDate),
  };
}

const parseANNTermsFromObject = (terms) => {
  const parsedTerms = {};

  for (const attribute of ANN_TERMS) {
    parsedTerms[attribute] = parseAttributeValue(attribute, terms[attribute]);
  }

  return parsedTerms;
}

const parseCECTermsFromObject = (terms) => {
  const parsedTerms = {};

  for (const attribute of CEC_TERMS) {
    parsedTerms[attribute] = parseAttributeValue(attribute, terms[attribute]);
  }

  return parsedTerms;
}

const parseCEGTermsFromObject = (terms) => {
  const parsedTerms = {};

  for (const attribute of CEG_TERMS) {
    parsedTerms[attribute] = parseAttributeValue(attribute, terms[attribute]);
  }

  return parsedTerms;
}

const parseCERTFTermsFromObject = (terms) => {
  const parsedTerms = {};

  for (const attribute of CERTF_TERMS) {
    const identifier = (attribute === 'contractReference_1' || attribute === 'contractReference_2') ? 'contractStructure' : attribute;
    parsedTerms[attribute] = parseAttributeValue(attribute, terms[identifier]);
  }

  return parsedTerms;
}

const parsePAMTermsFromObject = (terms) => { 
  const parsedTerms = {};

  for (const attribute of PAM_TERMS) {
    parsedTerms[attribute] = parseAttributeValue(attribute, terms[attribute]);
  }

  return parsedTerms;
}

const parseTermsFromObject = (contract, terms) => {
  if (contract === 'ANN') {
    return parseANNTermsFromObject(terms);
  } else if (contract === 'CEC') {
    return parseCECTermsFromObject(terms);
  } else if (contract === 'CEG') {
    return parseCEGTermsFromObject(terms);
  } else if (contract === 'CERTF') {
    return parseCERTFTermsFromObject(terms);
  } else if (contract === 'PAM') {
    return parsePAMTermsFromObject(terms);
  }

  throw new Error('Could not parse Terms. Unsupported contract type.');
}

module.exports = { 
  parseANNTermsFromObject,
  parseCECTermsFromObject,
  parseCEGTermsFromObject,
  parsePAMTermsFromObject,
  parseTermsFromObject,
  parseResultsFromObject,
  parseToTestEvent,
  parseToTestEventCERTF,
  fromPrecision,
  unixToISO,
  isoToUnix,
  roundToDecimals,
  numberOfDecimals
}
