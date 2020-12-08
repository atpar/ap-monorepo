// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SignedSafeMath.sol";

import "../../Core/Core.sol";
import "../../Core/SignedMath.sol";


contract AnnuityPaymentConventions is Core {
    using SignedSafeMath for int256;
    using SignedMath for int256;


    function annuityPayment(
        IPS memory cycleOfPrincipalRedemption,
        uint256 cycleAnchorDateOfPrincipalRedemption,
        uint256 maturityDate,
        int256 notionalPrincipal,
        int256 nominalInterestRate,
        int256 accruedInterest
    )
        internal
        pure
        returns (int256)
    {
        require(
            cycleOfPrincipalRedemption.isSet && cycleOfPrincipalRedemption.i != 0,
            "AnnuityPaymentConventions.annuityPayment: CYCLE_NOT_SET"
        );

        int256 nominalInterestRateFraction = nominalInterestRate
        .floatDiv(
            ONE_POINT_ZERO
            .floatDiv(getAverageCycleLength(cycleOfPrincipalRedemption))
        );
        uint256 numberOfPRCycles = getNumberOfCyclesInSegment(
            cycleOfPrincipalRedemption,
            cycleAnchorDateOfPrincipalRedemption,
            maturityDate
        );

        return notionalPrincipal
        .add(accruedInterest)
        .floatMult(
            nominalInterestRateFraction
            .floatDiv(
                ONE_POINT_ZERO
                .sub(
                    (
                        ONE_POINT_ZERO
                        .add(nominalInterestRateFraction)
                    )
                    .floatPow(-1 * int256(numberOfPRCycles + 1))
                )
            )
        );
    }
}