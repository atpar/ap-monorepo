pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "./ACTUSTypes.sol";
import "./ACTUSConstants.sol";
import "./Utils.sol";
import "./Schedule.sol";

import "./Conventions/BusinessDayConventions.sol";
import "./Conventions/ContractDefaultConventions.sol";
import "./Conventions/ContractRoleConventions.sol";
import "./Conventions/DayCountConventions.sol";
import "./Conventions/EndOfMonthConventions.sol";


/**
 * @title Core
 * @notice Contains all type definitions, conventions as specified by the ACTUS Standard
 * and utility methods for generating event schedules
 */
contract Core is
    ACTUSConstants,
    BusinessDayConventions,
    ContractDefaultConventions,
    ContractRoleConventions,
    DayCountConventions,
    EndOfMonthConventions,
    Utils,
    Schedule
{}
