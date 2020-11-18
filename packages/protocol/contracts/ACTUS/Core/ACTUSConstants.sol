// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;


/**
 * @title ACTUSConstants
 * @notice Contains all type definitions for ACTUS. See ACTUS-Dictionary for definitions
 */
contract ACTUSConstants {

    // constants used throughout
    uint256 constant public PRECISION = 18;
    int256 constant public ONE_POINT_ZERO = 1 * 10 ** 18;
    uint256 constant public MAX_CYCLE_SIZE = 120;
    uint256 constant public MAX_EVENT_SCHEDULE_SIZE = 120;
}
