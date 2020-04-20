pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../Core/SignedMath.sol";


/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestSignedMath {

    using SignedMath for int;

    function _floatMult(int256 a, int256 b)
        public
        pure
        returns (int256)
    {
        return int(a).floatMult(b);
    }

    function _floatDiv(int256 a, int256 b)
        public
        pure
        returns (int256)
    {
        return int(a).floatDiv(b);
    }

    function _min(int256 a, int256 b) public pure returns (int256) {
        return int(a).min(b);
    }

    function _max(int256 a, int256 b) public pure returns (int256) {
        return int(a).max(b);
    }
}
