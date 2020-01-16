pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./ACTUSTypes.sol";
import "./Utils.sol";
import "./Schedule.sol";

import "./Conventions/BusinessDayConvention.sol";
import "./Conventions/ContractDefaultConvention.sol";
import "./Conventions/ContractRoleConvention.sol";
import "./Conventions/DayCountConvention.sol";
import "./Conventions/EndOfMonthConvention.sol";


/**
 * @title Core
 * @notice Contains all type definitions, conventions as specified by the ACTUS Standard
 * and utility methods for generating event schedules
 */
contract Core is
    ACTUSTypes,
    BusinessDayConvention,
    ContractDefaultConvention,
    ContractRoleConvention,
    DayCountConvention,
    EndOfMonthConvention,
    Utils,
    Schedule
{}
