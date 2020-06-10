pragma solidity ^0.6.4;

import "@atpar/actus-solidity/contracts/Core/ACTUSTypes.sol";


library StateEncoder {

    function storeInPackedState(Asset storage asset, uint8 index, bytes32 value) private {
        // skip if value did not change
        if (asset.packedState[index] == value) return;
        asset.packedState[index] = value;
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
        storeInPackedState(asset, "notionalPrincipal", bytes32(state.notionalPrincipal));
        storeInPackedState(asset, "accruedInterest", bytes32(state.accruedInterest));
        storeInPackedState(asset, "feeAccrued", bytes32(state.feeAccrued));
        storeInPackedState(asset, "nominalInterestRate", bytes32(state.nominalInterestRate));
        storeInPackedState(asset, "interestScalingMultiplier", bytes32(state.interestScalingMultiplier));
        storeInPackedState(asset, "notionalScalingMultiplier", bytes32(state.notionalScalingMultiplier));
        storeInPackedState(asset, "nextPrincipalRedemptionPayment", bytes32(state.nextPrincipalRedemptionPayment));
        storeInPackedState(asset, "exerciseAmount", bytes32(state.exerciseAmount));
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
        storeInPackedState(asset, "F_notionalPrincipal", bytes32(state.notionalPrincipal));
        storeInPackedState(asset, "F_accruedInterest", bytes32(state.accruedInterest));
        storeInPackedState(asset, "F_feeAccrued", bytes32(state.feeAccrued));
        storeInPackedState(asset, "F_nominalInterestRate", bytes32(state.nominalInterestRate));
        storeInPackedState(asset, "F_interestScalingMultiplier", bytes32(state.interestScalingMultiplier));
        storeInPackedState(asset, "F_notionalScalingMultiplier", bytes32(state.notionalScalingMultiplier));
        storeInPackedState(asset, "F_nextPrincipalRedemptionPayment", bytes32(state.nextPrincipalRedemptionPayment));
        storeInPackedState(asset, "F_exerciseAmount", bytes32(state.exerciseAmount));
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
            int256(asset.packedState["notionalPrincipal"]),
            int256(asset.packedState["accruedInterest"]),
            int256(asset.packedState["feeAccrued"]),
            int256(asset.packedState["nominalInterestRate"]),
            int256(asset.packedState["interestScalingMultiplier"]),
            int256(asset.packedState["notionalScalingMultiplier"]),
            int256(asset.packedState["nextPrincipalRedemptionPayment"]),
            int256(asset.packedState["exerciseAmount"])
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
            int256(asset.packedState["F_notionalPrincipal"]),
            int256(asset.packedState["F_accruedInterest"]),
            int256(asset.packedState["F_feeAccrued"]),
            int256(asset.packedState["F_nominalInterestRate"]),
            int256(asset.packedState["F_interestScalingMultiplier"]),
            int256(asset.packedState["F_notionalScalingMultiplier"]),
            int256(asset.packedState["F_nextPrincipalRedemptionPayment"]),
            int256(asset.packedState["F_exerciseAmount"])
        );
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