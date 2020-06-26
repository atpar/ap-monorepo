const Web3Utils = require('web3-utils');


function getEpochOffsetForEventType (eventType) {
  return Number(eventType);
}

function sortEvents (_events) {
  _events.sort((_eventA, _eventB) => {
    const { eventType: eventTypeA, scheduleTime: scheduleTimeA } = decodeEvent(_eventA);
    const { eventType: eventTypeB, scheduleTime: scheduleTimeB } = decodeEvent(_eventB);

    if (Number(scheduleTimeA) === 0) { return 1; }
    if (Number(scheduleTimeB) === 0) { return -1; }
    if (Number(scheduleTimeA) > Number(scheduleTimeB)) { return 1; }
    if (Number(scheduleTimeA) < Number(scheduleTimeB)) { return -1; }
    
    if (getEpochOffsetForEventType(eventTypeA) > getEpochOffsetForEventType(eventTypeB)) { 
      return 1; 
    }
    if (getEpochOffsetForEventType(eventTypeA) < getEpochOffsetForEventType(eventTypeB)) {
      return -1;
    }

    return 0;
  });

  return _events;
}

function removeNullEvents (eventSchedule) {
  const compactEventSchedule = [];

  for (let event of eventSchedule) {
    if (String(decodeEvent(event).eventType) === '0') {
      continue; 
    }
    compactEventSchedule.push(event);
  }

  return compactEventSchedule;
}

const decodeEvent = (encodedEvent) => ({
  eventType: String(Web3Utils.hexToNumber('0x' + String(encodedEvent).substr(2, 2))),
  scheduleTime: String(Web3Utils.hexToNumber('0x' + String(encodedEvent).substr(10, encodedEvent.length)))
});

function encodeEvent (eventType, scheduleTime) {
  const eventTypeAsHex = Web3Utils.padLeft(Web3Utils.toHex(eventType), 2);
  const scheduleTimeAsHex = Web3Utils.padLeft(Web3Utils.toHex(scheduleTime), 62);

  return eventTypeAsHex + scheduleTimeAsHex.substr(2, scheduleTimeAsHex.length);
}

function parseEventSchedule (encodedEventSchedule) {
  return removeNullEvents(encodedEventSchedule).map(
    (encodedEvent) => decodeEvent(encodedEvent)
  );
}

module.exports = {
  sortEvents,
  removeNullEvents,
  decodeEvent,
  encodeEvent,
  parseEventSchedule
}