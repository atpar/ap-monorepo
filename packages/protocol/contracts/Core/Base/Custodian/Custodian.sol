// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

import "../Conversions.sol";
import "../../CEC/ICECRegistry.sol";
import "./ICustodian.sol";


/**
 * @title Custodian
 * @notice Contract which holds the collateral of CEC (Credit Enhancement Collateral) assets.
 */
contract Custodian is ICustodian, ReentrancyGuard, Conversions {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    event LockedCollateral(bytes32 indexed assetId, address collateralizer, uint256 collateralAmount);
    event ReturnedCollateral(bytes32 indexed assetId, address collateralizer, uint256 returnedAmount);

    address public cecActor;
    ICECRegistry public cecRegistry;
    mapping(bytes32 => bool) internal collateral;


    constructor(address _cecActor, ICECRegistry _cecRegistry) {
        cecActor = _cecActor;
        cecRegistry = _cecRegistry;
    }

    /**
     * @notice Locks the required collateral amount encoded in the second contract
     * reference in the terms.
     * @dev The collateralizer has to set allowance beforehand. The custodian increases
     * allowance for the AssetActor by amount of collateral
     * @param assetId id of the asset with collateral requirements
     * @param terms terms of the asset containing the collateral requirements
     * @param ownership ownership of the asset
     * @return true if the collateral was locked by the Custodian
     */
    function lockCollateral(
        bytes32 assetId,
        CECTerms calldata terms,
        AssetOwnership calldata ownership
    )
        external
        override
        returns (bool)
    {
        require(
            terms.contractRole == ContractRole.BUY || terms.contractRole == ContractRole.SEL,
            "Custodian.lockCollateral: INVALID_CONTRACT_ROLE"
        );
        require(
            (terms.contractRole == ContractRole.BUY)
                ? ownership.counterpartyObligor == address(this)
                : ownership.creatorObligor == address(this),
            "Custodian.lockCollateral: INVALID_OWNERSHIP"
        );

        // derive address of collateralizer
        address collateralizer = (terms.contractRole == ContractRole.BUY)
            ? ownership.counterpartyBeneficiary
            : ownership.creatorBeneficiary;

        // decode token address and amount of collateral
        (address collateralToken, uint256 collateralAmount) = decodeCollateralObject(terms.contractReference_2.object);
        // register collateral for assetId
        collateral[assetId] = true;

        // try transferring collateral from collateralizer to the custodian
        IERC20(collateralToken).safeTransferFrom(collateralizer, address(this), collateralAmount);
        // set allowance for AssetActor to later transfer collateral when EXE is triggered
        IERC20(collateralToken).safeIncreaseAllowance(cecActor, collateralAmount);

        emit LockedCollateral(assetId, collateralizer, collateralAmount);

        return true;
    }

    /**
     * @notice Returns the entire collateral back to the collateralizer if collateral
     * was not executed before the asset reached maturity or it returns the remaining
     * collateral (not executed amount) after collateral was executed and settled
     * @dev resets allowance for the Asset Actor,
     * reverts if state of the asset does not allow unlocking the collateral
     * @param assetId id of the asset for which to return the collateral,
     * @return true if the collateral was returned to the collateralizer
     */
    function returnCollateral(
        bytes32 assetId
    )
        external
        override
        returns (bool)
    {
        require(
            collateral[assetId] == true,
            "Custodian.returnCollateral: ENTRY_DOES_NOT_EXIST"
        );

        ContractRole contractRole = ContractRole(cecRegistry.getEnumValueForTermsAttribute(assetId, "contractRole"));
        ContractReference memory contractReference_2 = cecRegistry.getContractReferenceValueForTermsAttribute(
            assetId, "contractReference_2"
        );
        CECState memory state = cecRegistry.getState(assetId);
        AssetOwnership memory ownership = cecRegistry.getOwnership(assetId);

        // derive address of collateralizer
        address collateralizer = (contractRole == ContractRole.BUY)
            ? ownership.counterpartyBeneficiary
            : ownership.creatorBeneficiary;

        // decode token address and amount of collateral
        (address collateralToken, uint256 collateralAmount) = decodeCollateralObject(contractReference_2.object);

        // calculate amount to return
        uint256 notExecutedAmount;
        // if EXE was triggerd
        if (state.exerciseDate != uint256(0)) {
            notExecutedAmount = collateralAmount.sub(
                (state.exerciseAmount >= 0) ? uint256(state.exerciseAmount) : uint256(-1 * state.exerciseAmount)
            );
        // if EXE was not triggered and (reached maturity or was terminated)
        } else if (
            state.exerciseDate == uint256(0)
            && (
                state.contractPerformance == ContractPerformance.MD
                || state.contractPerformance == ContractPerformance.TD
            )
        ) {
            notExecutedAmount = collateralAmount;
        // throw if EXE was not triggered and maturity is not reached
        } else {
            revert("Custodian.returnCollateral: COLLATERAL_CAN_NOT_BE_RETURNED");
        }

        // reset allowance for AssetActor
        IERC20(collateralToken).safeDecreaseAllowance(cecActor, notExecutedAmount);
        // try transferring amount back to the collateralizer
        IERC20(collateralToken).safeTransfer(collateralizer, notExecutedAmount);

        emit ReturnedCollateral(assetId, collateralizer, notExecutedAmount);

        return true;
    }
}
