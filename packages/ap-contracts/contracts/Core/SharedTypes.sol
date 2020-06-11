pragma solidity ^0.6.4;

import "@atpar/actus-solidity/contracts/Core/ACTUSTypes.sol";
import "@atpar/actus-solidity/contracts/Core/ACTUSConstants.sol";


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
    // scheduleTime and EventType are tighlty packed and encoded as bytes32
    // in the context of a Template scheduleTime is defined as an offset in seconds
    // respective to an anchorDate which is defined in the CustomTerms of the asset which references this template
    // index of event => bytes32 encoded event
    mapping(uint256 => bytes32) events;
    // the length of the schedule, used to determine the end of the schedule
    uint256 length;
    // pointer to index of the next event in the schedule
    uint256 nextScheduleIndex;
    // last event which could not be settled
    bytes32 pendingEvent;
}

contract SharedTypes is ACTUSConstants {

    // offset == 0 is interpreted as a not set date value and not shifted
    // hence we define 1 as an offset == anchorDate
    uint256 constant internal ZERO_OFFSET = 1;
}
