const { sortEvents, removeNullEvents } = require('./scheduleUtils');

// const ZeroTerms = require('./ZeroTerms.json');
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
  } else {
    throw new Error('Contract Type not supported.');
  }
}

async function generateSchedule(engineContractInstance, terms) {
  const events = [];
  events.push(...(await engineContractInstance.computeNonCyclicScheduleSegment(terms, 0, terms.maturityDate)));
  events.push(...(await engineContractInstance.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, 2)));
  events.push(...(await engineContractInstance.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, 3)));
  events.push(...(await engineContractInstance.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, 6)));
  events.push(...(await engineContractInstance.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, 8)));
  events.push(...(await engineContractInstance.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, 9)));
  events.push(...(await engineContractInstance.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, 12)));
  events.push(...(await engineContractInstance.computeCyclicScheduleSegment(terms, 0, terms.maturityDate, 17)));

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

module.exports = {
  getEngineContractInstanceForContractType,
  generateSchedule,
  removeNullEvents,
  ZERO_ADDRESS,
  ZERO_BYTES32,
  ZERO_BYTES,
  parseTerms
}
