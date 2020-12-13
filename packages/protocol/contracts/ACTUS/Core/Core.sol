// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "./ACTUSTypes.sol";
import "./ACTUSConstants.sol";
import "./Utils/Utils.sol";
import "./Conventions/BusinessDayConventions.sol";
import "./Conventions/ContractRoleConventions.sol";
import "./Conventions/DayCountConventions.sol";
import "./Conventions/EndOfMonthConventions.sol";
import "./Conventions/AnnuityPaymentConventions.sol";


/**
 * @title Core
 * @notice Contains all type definitions, conventions as specified by the ACTUS Standard
 * and utility methods for generating event schedules
 */
contract Core is
    ACTUSConstants,
    ContractRoleConventions,
    DayCountConventions,
    EndOfMonthConventions,
    AnnuityPaymentConventions,
    Utils
{}
