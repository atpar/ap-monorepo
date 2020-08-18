const { sortEvents, removeNullEvents } = require('./scheduleUtils');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
const ZERO_BYTES = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';


function getEngineContractInstanceForContractType(instances, contractType) {
  if (contractType === 0) {
    return instances.PAMEngineInstance;
  } else if (contractType === 1) {
    return instances.ANNEngineInstance;
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

async function generateSchedule(engineContractInstance, terms, tMax) {
  const events = [];
  events.push(...(await engineContractInstance.methods.computeNonCyclicScheduleSegment(terms, 0, 1000000000000).call()));

  events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, 3).call()));
  events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, 4).call()));
  events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, 7).call()));
  events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, 9).call()));
  events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, 10).call()));
  events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, 13).call()));
  events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, 18).call()));
  events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, (terms.maturityDate > 0) ? terms.maturityDate : tMax, 21).call()));
  events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, (terms.maturityDate > 0) ? terms.maturityDate : tMax, 22).call()));
  events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, (terms.maturityDate > 0) ? terms.maturityDate : tMax, 23).call()));
  events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, (terms.maturityDate > 0) ? terms.maturityDate : tMax, 24).call()));
  events.push(...(await engineContractInstance.methods.computeCyclicScheduleSegment(terms, 0, (terms.maturityDate > 0) ? terms.maturityDate : tMax, 26).call()));

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

module.exports = {
  getEngineContractInstanceForContractType,
  generateSchedule,
  removeNullEvents,
  ZERO_ADDRESS,
  ZERO_BYTES32,
  ZERO_BYTES,
  parseTerms,
  web3ResponseToState
}
