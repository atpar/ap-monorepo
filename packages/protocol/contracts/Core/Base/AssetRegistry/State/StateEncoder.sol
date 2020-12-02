// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;

import "../../SharedTypes.sol";
import "../BaseRegistryStorage.sol";


library StateEncoder {

    function storeInPackedState(Asset storage asset, bytes32 attributeKey, bytes32 value) private {
        // skip if value did not change
        if (asset.packedState[attributeKey] == value) return;
        asset.packedState[attributeKey] = value;
    }

    /**
     * @dev Tightly pack and store State
     */
    function encodeAndSetState(Asset storage asset, State memory state) internal {
        storeInPackedState(asset, "contractPerformance", bytes32(uint256(uint8(state.contractPerformance))) << 248);
        storeInPackedState(asset, "statusDate", bytes32(state.statusDate));
        storeInPackedState(asset, "nonPerformingDate", bytes32(state.nonPerformingDate));
        storeInPackedState(asset, "maturityDate", bytes32(state.maturityDate));
        storeInPackedState(asset, "exerciseDate", bytes32(state.exerciseDate));
        storeInPackedState(asset, "terminationDate", bytes32(state.terminationDate));
        storeInPackedState(asset, "lastCouponFixingDate", bytes32(state.lastCouponFixingDate));
        storeInPackedState(asset, "lastDividendFixingDate", bytes32(state.lastDividendFixingDate));

        storeInPackedState(asset, "notionalPrincipal", bytes32(state.notionalPrincipal));
        storeInPackedState(asset, "accruedInterest", bytes32(state.accruedInterest));
        storeInPackedState(asset, "feeAccrued", bytes32(state.feeAccrued));
        storeInPackedState(asset, "nominalInterestRate", bytes32(state.nominalInterestRate));
        storeInPackedState(asset, "interestScalingMultiplier", bytes32(state.interestScalingMultiplier));
        storeInPackedState(asset, "notionalScalingMultiplier", bytes32(state.notionalScalingMultiplier));
        storeInPackedState(asset, "nextPrincipalRedemptionPayment", bytes32(state.nextPrincipalRedemptionPayment));
        storeInPackedState(asset, "exerciseAmount", bytes32(state.exerciseAmount));
        storeInPackedState(asset, "exerciseQuantity", bytes32(state.exerciseQuantity));

        storeInPackedState(asset, "exerciseQuantity", bytes32(state.exerciseQuantity));
        storeInPackedState(asset, "quantity", bytes32(state.quantity));
        storeInPackedState(asset, "couponAmountFixed", bytes32(state.couponAmountFixed));
        storeInPackedState(asset, "marginFactor", bytes32(state.marginFactor));
        storeInPackedState(asset, "adjustmentFactor", bytes32(state.adjustmentFactor));
        storeInPackedState(asset, "dividendPaymentAmount", bytes32(state.dividendPaymentAmount));
        storeInPackedState(asset, "splitRatio", bytes32(state.splitRatio));
    }

    /**
     * @dev Tightly pack and store finalized State
     */
    function encodeAndSetFinalizedState(Asset storage asset, State memory state) internal {
        storeInPackedState(asset, "F_contractPerformance", bytes32(uint256(uint8(state.contractPerformance))) << 248);
        storeInPackedState(asset, "F_statusDate", bytes32(state.statusDate));
        storeInPackedState(asset, "F_nonPerformingDate", bytes32(state.nonPerformingDate));
        storeInPackedState(asset, "F_maturityDate", bytes32(state.maturityDate));
        storeInPackedState(asset, "F_exerciseDate", bytes32(state.exerciseDate));
        storeInPackedState(asset, "F_terminationDate", bytes32(state.terminationDate));
        storeInPackedState(asset, "F_lastCouponFixingDate", bytes32(state.lastCouponFixingDate));
        storeInPackedState(asset, "F_lastDividendFixingDate", bytes32(state.lastDividendFixingDate));

        storeInPackedState(asset, "F_notionalPrincipal", bytes32(state.notionalPrincipal));
        storeInPackedState(asset, "F_accruedInterest", bytes32(state.accruedInterest));
        storeInPackedState(asset, "F_feeAccrued", bytes32(state.feeAccrued));
        storeInPackedState(asset, "F_nominalInterestRate", bytes32(state.nominalInterestRate));
        storeInPackedState(asset, "F_interestScalingMultiplier", bytes32(state.interestScalingMultiplier));
        storeInPackedState(asset, "F_notionalScalingMultiplier", bytes32(state.notionalScalingMultiplier));
        storeInPackedState(asset, "F_nextPrincipalRedemptionPayment", bytes32(state.nextPrincipalRedemptionPayment));
        storeInPackedState(asset, "F_exerciseAmount", bytes32(state.exerciseAmount));
        storeInPackedState(asset, "F_exerciseQuantity", bytes32(state.exerciseQuantity));

        storeInPackedState(asset, "F_exerciseQuantity", bytes32(state.exerciseQuantity));
        storeInPackedState(asset, "F_quantity", bytes32(state.quantity));
        storeInPackedState(asset, "F_couponAmountFixed", bytes32(state.couponAmountFixed));
        storeInPackedState(asset, "F_marginFactor", bytes32(state.marginFactor));
        storeInPackedState(asset, "F_adjustmentFactor", bytes32(state.adjustmentFactor));
        storeInPackedState(asset, "F_dividendPaymentAmount", bytes32(state.dividendPaymentAmount));
        storeInPackedState(asset, "F_splitRatio", bytes32(state.splitRatio));
    }

    /**
     * @dev Decode and load the State of the asset
     */
    function decodeAndGetState(Asset storage asset) internal view returns (State memory) {
        return State(
            ContractPerformance(uint8(uint256(asset.packedState["contractPerformance"] >> 248))),
            uint256(asset.packedState["statusDate"]),
            uint256(asset.packedState["nonPerformingDate"]),
            uint256(asset.packedState["maturityDate"]),
            uint256(asset.packedState["exerciseDate"]),
            uint256(asset.packedState["terminationDate"]),
            uint256(asset.packedState["lastCouponFixingDate"]),
            uint256(asset.packedState["lastDividendFixingDate"]),

            int256(asset.packedState["notionalPrincipal"]),
            int256(asset.packedState["accruedInterest"]),
            int256(asset.packedState["feeAccrued"]),
            int256(asset.packedState["nominalInterestRate"]),
            int256(asset.packedState["interestScalingMultiplier"]),
            int256(asset.packedState["notionalScalingMultiplier"]),
            int256(asset.packedState["nextPrincipalRedemptionPayment"]),
            int256(asset.packedState["exerciseAmount"]),
            int256(asset.packedState["exerciseQuantity"]),

            int256(asset.packedState["quantity"]),
            int256(asset.packedState["couponAmountFixed"]),
            int256(asset.packedState["marginFactor"]),
            int256(asset.packedState["adjustmentFactor"]),
            int256(asset.packedState["dividendPaymentAmount"]),
            int256(asset.packedState["splitRatio"])
        );
    }

    /**
     * @dev Decode and load the finalized State of the asset
     */
    function decodeAndGetFinalizedState(Asset storage asset) internal view returns (State memory) {
        return State(
            ContractPerformance(uint8(uint256(asset.packedState["F_contractPerformance"] >> 248))),
            uint256(asset.packedState["F_statusDate"]),
            uint256(asset.packedState["F_nonPerformingDate"]),
            uint256(asset.packedState["F_maturityDate"]),
            uint256(asset.packedState["F_exerciseDate"]),
            uint256(asset.packedState["F_terminationDate"]),
            uint256(asset.packedState["F_lastCouponFixingDate"]),
            uint256(asset.packedState["F_lastDividendFixingDate"]),

            int256(asset.packedState["F_notionalPrincipal"]),
            int256(asset.packedState["F_accruedInterest"]),
            int256(asset.packedState["F_feeAccrued"]),
            int256(asset.packedState["F_nominalInterestRate"]),
            int256(asset.packedState["F_interestScalingMultiplier"]),
            int256(asset.packedState["F_notionalScalingMultiplier"]),
            int256(asset.packedState["F_nextPrincipalRedemptionPayment"]),
            int256(asset.packedState["F_exerciseAmount"]),
            int256(asset.packedState["F_exerciseQuantity"]),

            int256(asset.packedState["F_quantity"]),
            int256(asset.packedState["F_couponAmountFixed"]),
            int256(asset.packedState["F_marginFactor"]),
            int256(asset.packedState["F_adjustmentFactor"]),
            int256(asset.packedState["F_dividendPaymentAmount"]),
            int256(asset.packedState["F_splitRatio"])
        );
    }


    function decodeAndGetEnumValueForStateAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (uint8)
    {
        if (attributeKey == bytes32("contractPerformance")) {
            return uint8(uint256(asset.packedState["contractPerformance"] >> 248));
        } else if (attributeKey == bytes32("F_contractPerformance")) {
            return uint8(uint256(asset.packedState["F_contractPerformance"] >> 248));
        } else {
            return uint8(0);
        }
    }

    function decodeAndGetUIntValueForForStateAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (uint256)
    {
        return uint256(asset.packedState[attributeKey]);
    }

    function decodeAndGetIntValueForForStateAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (int256)
    {
        return int256(asset.packedState[attributeKey]);
    }
}
