// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;

/**
 * @title SafeConversion
 * @dev Math operations with safety checks that revert on error
 */
library SafeConversion {
    function toUint256Safe(int256 a) internal pure returns (uint256) {
        require(a >= 0);
        return uint256(a);
    }

    function toInt256Safe(uint256 a) internal pure returns (int256) {
        int256 b = int256(a);
        require(b >= 0);
        return b;
    }
}