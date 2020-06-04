const Web3Utils = require('web3-utils');


function getEpochOffsetForEventType (eventType) {
  if (eventType === 0) { return 0; } // NE
  if (eventType === 1) { return 1; } // IED
  if (eventType === 2) { return 2; } // FP
  if (eventType === 3) { return 3; } // PR
  if (eventType === 4) { return 4; } // PR
  if (eventType === 5) { return 5; } // PRF
  if (eventType === 6) { return 6; } // PY
  if (eventType === 7) { return 6; } // PP
  if (eventType === 8) { return 8; } // IP
  if (eventType === 9) { return 9; } // IPCI
  if (eventType === 10) { return 10; } // CE
  if (eventType === 11) { return 11; } // RRF
  if (eventType === 12) { return 12; } // RR
  if (eventType === 13) { return 13; } // DV
  if (eventType === 14) { return 14; } // PRD
  if (eventType === 15) { return 15; } // MR
  if (eventType === 16) { return 16; } // TD
  if (eventType === 17) { return 17; } // SC
  if (eventType === 18) { return 18; } // IPCB
  if (eventType === 19) { return 19; } // MD
  if (eventType === 20) { return 20; } // RD
  if (eventType === 21) { return 21; } // XD
  if (eventType === 22) { return 22; } // STD
  if (eventType === 23) { return 23; } // AD
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
  return encodedEventSchedule.map((encodedEvent) => decodeEvent(encodedEvent));
}

module.exports = { 
  sortEvents, 
  removeNullEvents, 
  decodeEvent,
  parseEventSchedule
}
