const Web3Utils = require('web3-utils');


function getEpochOffsetForEventType (eventType) {
  return eventType;
}

function sortEvents (_events) {
  _events.sort((_eventA, _eventB) => {
    const { eventType: eventTypeA, scheduleTime: scheduleTimeA } = decodeEvent(_eventA);
    const { eventType: eventTypeB, scheduleTime: scheduleTimeB } = decodeEvent(_eventB)

    if (scheduleTimeA == 0) { return 1 }
    if (scheduleTimeB == 0) { return -1 }
    if (scheduleTimeA > scheduleTimeB) { return 1 }
    if (scheduleTimeA < scheduleTimeB) { return -1 }
    
    if (getEpochOffsetForEventType(eventTypeA) > getEpochOffsetForEventType(eventTypeB)) { 
      return 1; 
    }
    if (getEpochOffsetForEventType(eventTypeA) < getEpochOffsetForEventType(eventTypeB)) {
      return -1;
    }

    return 0
  });

  return _events;
}

function removeNullEvents (_eventSchedule) {
  const compactEventSchedule = [];

  for (_event of _eventSchedule) {
    if (decodeEvent(_event).scheduleTime === 0) { continue }
    compactEventSchedule.push(_event);
  }

  return compactEventSchedule;
}

function decodeEvent (encodedEvent) {
  return {
    eventType: Web3Utils.hexToNumber('0x' + String(encodedEvent).substr(2, 2)),
    scheduleTime: Web3Utils.hexToNumber('0x' + String(encodedEvent).substr(10, encodedEvent.length))
  };
}

function parseEventSchedule (encodedEventSchedule) {
  return encodedEventSchedule.map((encodedEvent) => decodeEvent(encodedEvent));
}

module.exports = { 
  sortEvents, 
  removeNullEvents, 
  decodeEvent,
  parseEventSchedule
}
