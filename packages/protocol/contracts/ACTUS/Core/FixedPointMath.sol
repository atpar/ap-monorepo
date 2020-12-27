// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;


/**
 * Fixed point math library for signed integers
 */
library FixedPointMath {

    int256 constant private INT256_MIN = -2 ** 255;

    uint256 constant public PRECISION = 18;
    uint256 constant public MULTIPLICATOR = 10 ** PRECISION;


    /**
     * @dev The product of a and b has to be less than INT256_MAX (~10 ** 76),
     * as devision (normalization) is performed after multiplication
     * Upper boundary would be (10 ** 58) * (MULTIPLICATOR) == ~10 ** 76
     */
    function fixedMul(int256 a, int256 b) internal pure returns (int256) {
        if (a == 0 || b == 0) return 0;

        require(
            !(a == -1 && b == INT256_MIN),
            "FixedPointMath.fixedMul: OVERFLOW_DETECTED"
        );

        int256 c = a * b;
        require(
            c / a == b,
            "FixedPointMath.fixedMul: OVERFLOW_DETECTED"
        );

        // normalize (divide by MULTIPLICATOR)
        int256 d = c / int256(MULTIPLICATOR);
        require(
            d != 0,
            "FixedPointMath.fixedMul: CANNOT_REPRESENT_GRANULARITY"
        );

        return d;
    }

    function fixedDiv(int256 a, int256 b) internal pure returns (int256) {
        require(
            b != 0,
            "FixedPointMath.fixedDiv: DIVIDED_BY_ZERO"
        );

        if (a == 0) return 0;

        // normalize (multiply by MULTIPLICATOR)
        int256 c = a * int256(MULTIPLICATOR);
        require(
            c / a == int256(MULTIPLICATOR),
            "FixedPointMath.fixedDiv: OVERFLOW_DETECTED"
        );

        require(
            !(b == -1 && a == INT256_MIN),
            "FixedPointMath.fixedDiv: OVERFLOW_DETECTED"
        );

        int256 d = c / b;
        require(
            d != 0,
            "FixedPointMath.fixedDiv: CANNOT_REPRESENT_GRANULARITY"
        );

        return d;
    }

    /**
     * @dev Returns the smallest of two signed numbers.
     */
    function min(int256 a, int256 b) internal pure returns (int256) {
        return a <= b ? a : b;
    }

    /**
     * @dev Returns the largest of two signed numbers.
     */
    function max(int256 a, int256 b) internal pure returns (int256) {
        return a >= b ? a : b;
    }
}
