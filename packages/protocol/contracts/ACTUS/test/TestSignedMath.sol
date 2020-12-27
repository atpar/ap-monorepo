// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../Core/FixedPointMath.sol";


/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestFixedPointMath {

    using FixedPointMath for int;

    function _fixedMul(int256 a, int256 b)
        public
        pure
        returns (int256)
    {
        return int(a).fixedMul(b);
    }

    function _fixedDiv(int256 a, int256 b)
        public
        pure
        returns (int256)
    {
        return int(a).fixedDiv(b);
    }

    function _min(int256 a, int256 b) public pure returns (int256) {
        return int(a).min(b);
    }

    function _max(int256 a, int256 b) public pure returns (int256) {
        return int(a).max(b);
    }
}
