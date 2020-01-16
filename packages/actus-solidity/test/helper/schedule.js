const Web3Utils = require('web3-utils');


function getEpochOffsetForEventType (eventType) {
  if (eventType === 5) { return 20; } // IED
  if (eventType === 15) { return 25; } // PR
  if (eventType === 8) { return 30; } // IP
  if (eventType === 7) { return 40; } // IPCI
  if (eventType === 4) { return 50; } // FP
  if (eventType === 2) { return 60; } // DV
  if (eventType === 9) { return 80; } // MR
  if (eventType === 17) { return 90; } // RRF
  if (eventType === 18) { return 100; } // RR
  if (eventType === 19) { return 110; } // SC
  if (eventType === 6) { return 120; } // IPCB
  if (eventType === 16) { return 130; } // PRD
  if (eventType === 21) { return 140; } // TD
  if (eventType === 20) { return 150; } // STD
  if (eventType === 10) { return 160; } // MD
  if (eventType === 0) { return 950; } // AD
  return 0;
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
  return removeNullEvents(
    encodedEventSchedule
  ).map((encodedEvent) => decodeEvent(encodedEvent));
}

module.exports = { 
  sortEvents, 
  removeNullEvents, 
  decodeEvent,
  parseEventSchedule
}
