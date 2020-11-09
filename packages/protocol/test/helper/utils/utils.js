/* eslint-disable @typescript-eslint/no-var-requires */
const { getEnumIndexForEventType: eventIndex } = require('../../helper/utils/dictionary');
const { sortEvents, removeNullEvents } = require('./schedule');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
const ZERO_BYTES = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';


function getEngineContractInstanceForContractType(instances, contractType) {
  if (contractType === 0) {
    return instances.PAMEngineInstance;
  } else if (contractType === 1) {
    return instances.ANNEngineInstance;
  } else if (contractType === 8) {
    return instances.STKEngineInstance;
  } else if (contractType === 16) {
    return instances.CEGEngineInstance;
  } else if (contractType === 17) {
    return instances.CECEngineInstance;
  } else if (contractType === 18) {
    return instances.CERTFEngineInstance;
  } else {
    throw new Error('Contract Type not supported.');
  }
}

async function generateSchedule(engineContractInstance, terms, tMax, eventTypes = []) {
  const events = [];
  events.push(...(await engineContractInstance.methods.computeNonCyclicScheduleSegment(terms, 0, 1000000000000).call()));

  if (eventTypes.length > 0) {
    const theEnd = terms.maturityDate > 0 ? terms.maturityDate : (
      tMax > 0 ? tMax : 1000000000000
    );
    await eventTypes.reduce(
      // one by one (but not in parallel)
      (promiseChain, eventType) => promiseChain.then(
        async () => events.push(...(
          await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, theEnd, eventType).call())
        )
      ), Promise.resolve(),
    );
  } else {
    events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, eventIndex('FP')).call()));
    events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, eventIndex('PR')).call()));
    events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, eventIndex('PY')).call()));
    events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, eventIndex('IP')).call()));
    events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, eventIndex('IPCI')).call()));
    events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, eventIndex('RR')).call()));
    events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, eventIndex('SC')).call()));
    events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, (terms.maturityDate > 0) ? terms.maturityDate : tMax, eventIndex('COF')).call()));
    events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, (terms.maturityDate > 0) ? terms.maturityDate : tMax, eventIndex('COP')).call()));
    events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, (terms.maturityDate > 0) ? terms.maturityDate : tMax, eventIndex('REF')).call()));
    events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, (terms.maturityDate > 0) ? terms.maturityDate : tMax, eventIndex('REP')).call()));
    events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, (terms.maturityDate > 0) ? terms.maturityDate : tMax, eventIndex('EXE')).call()));
  }

  return sortEvents(removeNullEvents(events));
}

function parseTerms (array) {
  return array.map((value) => {
    switch (typeof value) {
      case 'object':
        return (Array.isArray(value)) ? parseTerms(value) : parseTerms(Object.values(value));
      case 'number':
        return value.toString();
      case 'boolean':
        return value;
      case 'string':
        return (web3.utils.isHexStrict(value) && value.length < 42)
          ? web3.utils.hexToNumberString(value)
          : (value !== '0x0000000000000000000000000000000000000000000000000000000000000000')
            ? value
            : "0";
      default:
        return value;
    }
  });
}

const web3ResponseToState = (arr) => ({
  ...Object.keys(arr).reduce((obj, element) => (
    (!Number.isInteger(Number(element)))
      ? {
        ...obj,
        [element]: (Array.isArray(arr[element]))
          ? web3ResponseToState(arr[element])
          : arr[element]
      }
      : obj
  ), {})
});

/**
 * @param events {{name: string, event: Object}} - `events` property of the web3 transaction object
 * @param eventName {string}
 * @param eventArgs{{key: string, value: any}}
 * @return {Object|null} - if found, `event` object from `events`
 */
function findEvent (events, eventName, eventArgs = {}) {
  const foundName = Object.keys(events).find((key) => {
    if (key === eventName) {
      for (const [k, v] of Object.entries(eventArgs)) {
        const eventsArray = Array.isArray(events[eventName]) ? events[eventName] : [ events[eventName] ];
        for(const e of eventsArray) {
          if ( e.returnValues[k] !== v ) return false;
        }
      }
      return true;
    }
  });
  return foundName ? events[foundName] : null;
}

/**
 * `expect` an event in the web3 transaction object
 * @param events {{name: string, event: Object}} - `events` property of the web3 transaction object
 * @param {string} eventName - event to expect
 * @param {{key: string, value: any}} [eventArgs] - (optional) event arguments to expect
 * @return {Object|null} - if found, `event` object from `events`
 */
function expectEvent(events, eventName, eventArgs = {}) {
  const event = findEvent(events, eventName, eventArgs);
  if (event === null) {
    throw new Error(`Expected event (${eventName}) has not been found`);
  }
  return event;
}

module.exports = {
  getEngineContractInstanceForContractType,
  generateSchedule,
  expectEvent,
  findEvent,
  removeNullEvents,
  ZERO_ADDRESS,
  ZERO_BYTES32,
  ZERO_BYTES,
  parseTerms,
  web3ResponseToState
}
