// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;

import "../../ACTUS/Core/ACTUSTypes.sol";
import "../../ACTUS/Core/ACTUSConstants.sol";


struct AssetOwnership {
    // account which has to fulfill all obligations for the creator side
    address creatorObligor;
    // account to which all cashflows to which the creator is the beneficiary are forwarded
    address creatorBeneficiary;
    // account which has to fulfill all obligations for the counterparty
    address counterpartyObligor;
    // account to which all cashflows to which the counterparty is the beneficiary are forwarded
    address counterpartyBeneficiary;
}

struct Schedule {
    // scheduleTime and EventType are tightly packed and encoded as bytes32
    // ...
    mapping(EventType => uint256) lastScheduleTimeOfCyclicEvent;
    // index of event => bytes32 encoded event
    mapping(uint256 => bytes32) events;
    // the length of the schedule, used to determine the end of the schedule
    uint256 length;
    // pointer to index of the next event in the schedule
    uint256 nextScheduleIndex;
    // last event which could not be settled
    bytes32 pendingEvent;
}
