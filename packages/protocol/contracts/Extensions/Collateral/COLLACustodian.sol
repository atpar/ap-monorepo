// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

import "../../ACTUS/Core/Utils/EventUtils.sol";
import "../../ACTUS/Core/FixedPointMath.sol";

import "../../Core/Base/AssetRegistry/IAssetRegistry.sol";
import "../../Core/Base/OracleProxy/IPriceOracleProxy.sol";
import "../../Core/Base/Conversions.sol";
import "../IExtension.sol";


/**
 * @title COLLACustodian
 * @notice Contract which holds collateral for ACTUS Protocol assets. 
 */
contract COLLACustodian is EventUtils, Conversions, IExtension {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    using FixedPointMath for int256;

    event AddedCollateral(bytes32 indexed assetId, address collateralizer, uint256 collateralAmount);
    event WithdrewCollateral(bytes32 indexed assetId, address collateralizer, uint256 withdrawnAmount);
    event ClaimedCollateral(bytes32 indexed assetId, address creditor, uint256 claimedAmount);

    IAssetRegistry public assetRegistry;
    IPriceOracleProxy public priceFeed;

    struct Collateral {
        uint256 amount;
        uint256 claimableAmount;
    }

    // assetId => collateral
    mapping(bytes32 => Collateral) internal collateral;


    constructor(IAssetRegistry _assetRegistry, IPriceOracleProxy _priceFeed) {
        assetRegistry = _assetRegistry;
        priceFeed = _priceFeed;
    }

    /**
     * @notice Return CE event if current collateral value is below the collateral requirement 
     * defined in the terms of the asset, if the asset has not reached final state.
     * @dev Implements IExtension interface
     * @param assetId Id of the asset
     * @return Event
     */
    function onProgress(bytes32 assetId) external override returns (bytes32) {
        require(
            assetRegistry.isRegistered(assetId) == true,
            "Collateral.addCollateral: ASSET_DOES_NOT_EXIST"
        );

        if (
            // avoid emitting the CE event multiple by checking if asset has reached final state
            isInFinalState(assetId) == false
            // check min. amount of collateral tokens
            || collateral[assetId].amount >= computeMinCollateralAmount(assetId)
        ) {
            return bytes32(0);
        }

        // set claimable amount at time of default (assuming := time of progress)
        collateral[assetId].claimableAmount = collateral[assetId].amount;

        return encodeEvent(EventType.EXE, block.timestamp);
    }

    /**
     * @notice For initial collateralization or for topping up collateral to avoid falling 
     * below the collateralization ratio.
     * @dev The collateralizer has to set allowance beforehand.
     * @param assetId id of the asset with collateral requirements
     * @param addAmount amount of collateral tokens to add
     */
    function addCollateral(bytes32 assetId, uint256 addAmount) external {
        require(
            assetRegistry.isRegistered(assetId) == true,
            "Collateral.addCollateral: ASSET_DOES_NOT_EXIST"
        );
        require(
            isInFinalState(assetId),
            "Collateral.addCollateral: NOT_COLLATERALIZABLE"
        );

        // increase collateral amount for assetId
        collateral[assetId].amount = collateral[assetId].amount.add(addAmount);
        // try transferring collateral from msg.sender to the custodian
        IERC20(
            assetRegistry.getAddressValueForTermsAttribute(assetId, "collateralCurrency")
        ).safeTransferFrom(msg.sender, address(this), addAmount);

        emit AddedCollateral(assetId, msg.sender, addAmount);
    }

    /**
     * @notice For withdrawing the entire collateral after the asset reached maturity
     * or to withdraw up to the collateralization ratio.
     * @dev Can only be called by the collateralizer.
     * @param assetId Id of the collateralized asset
     * @param withdrawAmount amount of collateral tokens to withdraw
     */
    function withdrawCollateral(bytes32 assetId, uint256 withdrawAmount) external {
        require(
            assetRegistry.isRegistered(assetId) == true,
            "Collateral.withdrawCollateral: ASSET_DOES_NOT_EXIST"
        );

        (address collateralizer, ) = deriveCollateralizerAndCreditor(assetId);

        require(
            msg.sender == collateralizer,
            "Collateral.withdrawCollateral: UNAUTHORIZED_SENDER"
        );
        require(
            collateral[assetId].amount.sub(withdrawAmount) >= computeMinCollateralAmount(assetId)
            || ContractPerformance(
                assetRegistry.getEnumValueForTermsAttribute(assetId, "contractPerformance")
            ) == ContractPerformance.MD,
            "Collateral.withdrawCollateral: INSUFFICIENT_COLLATERAL_RATIO"
        );

        address collateralCurrency = assetRegistry.getAddressValueForTermsAttribute(assetId, "collateralCurrency");
        // decrease collateral amount for assetId
        collateral[assetId].amount = collateral[assetId].amount.sub(withdrawAmount);
        // try transferring the collateral back to the collateralizer
        IERC20(collateralCurrency).safeTransfer(msg.sender, withdrawAmount);

        emit WithdrewCollateral(assetId, msg.sender, withdrawAmount);
    }

    /**
     * @notice For claiming executed collateral on behalf of the creditor. Requires that the asset
     * is already progessed into final state (default).
     * @dev Can be called by anyone.
     * @param assetId Id of the collateralized asset
     */
    function claimCollateral(bytes32 assetId) external {
        require(
            assetRegistry.isRegistered(assetId) == true,
            "Collateral.claimCollateral: ASSET_DOES_NOT_EXIST"
        );

        uint256 claimableAmount = collateral[assetId].claimableAmount;

        require(
            claimableAmount >= 0,
            "Collateral.claimCollateral: NOTHING_TO_CLAIM"
        );

        (, address creditor) = deriveCollateralizerAndCreditor(assetId);
        // mark collateral as claimed
        collateral[assetId].claimableAmount = 0;
        // try transferring the collateral to the creditor
        IERC20(
            assetRegistry.getAddressValueForTermsAttribute(assetId, "collateralCurrency")
        ).safeTransfer(creditor, claimableAmount);

        emit ClaimedCollateral(assetId, creditor, claimableAmount);
    }

    /**
     * @notice Derives the address of the collateralizer and the creditor from the ownership
     * of an registered asset.
     * @param assetId Id of the asset
     * @return collateralizer Address of collateralizer
     * @return creditor Address of the creditor if the collateral gets executed
     */
    function deriveCollateralizerAndCreditor(bytes32 assetId)
        public
        view
        returns (address collateralizer, address creditor)
    {
        require(
            assetRegistry.isRegistered(assetId) == true,
            "Collateral.claimCollateral: ASSET_DOES_NOT_EXIST"
        );

        // derive address of creditor
        ContractRole contractRole = ContractRole(
            assetRegistry.getEnumValueForTermsAttribute(assetId, "contractRole")
        );
        require (
            contractRole == ContractRole.BUY || contractRole == ContractRole.SEL,
            "Collateral.claimCollateral: INVALID_CONTRACT_ROLE"
        );

        AssetOwnership memory ownership = assetRegistry.getOwnership(assetId);

        (collateralizer, creditor) = (contractRole == ContractRole.BUY)
            ? (ownership.counterpartyObligor, ownership.creatorBeneficiary)
            : (ownership.creatorObligor, ownership.counterpartyBeneficiary);
    }

    /**
     * @notice Computes the currently min. amount of collateral tokens required from the
     * collateralization ratio defined in the terms of the asset and the curent value of collateral tokens.
     * @param assetId Id of an registered asset
     * @return amount of collateral tokens
     */
    function computeMinCollateralAmount(bytes32 assetId) public view returns (uint256) {
        require(
            assetRegistry.isRegistered(assetId) == true,
            "Collateral.claimCollateral: ASSET_DOES_NOT_EXIST"
        );

        address currency = assetRegistry.getAddressValueForTermsAttribute(assetId, "currency");
        address collateralCurrency = assetRegistry.getAddressValueForTermsAttribute(assetId, "collateralCurrency");
        int256 coverage = assetRegistry.getIntValueForTermsAttribute(assetId, "coverageOfCollateral");
        int256 principal = assetRegistry.getIntValueForTermsAttribute(assetId, "notionalPrincipal");
       
        int256 minCollateralAmount = principal.fixedMul(coverage);
        
        // if collateral token != asset currency --> determine value
        if (currency != collateralCurrency) {
            (int256 rate, bool isSet) = priceFeed.getData(
                assetRegistry.getBytes32ValueForTermsAttribute(assetId, "marketObjectCodeOfCollateral")
            );
            require(
                isSet == true,
                "Collateral.computeMinCollateralAmount: NO_RATE_FOUND"
            );
            minCollateralAmount = minCollateralAmount.fixedMul(rate);
        }
        
        return uint256(minCollateralAmount);
    }

    /**
     * @notice Checks if the current collateral value is below the collateralization ratio for an asset.
     * @param assetId Id of an asset
     * @return Returns true if its undercollateralized
     */
    function isUndercollateralized(bytes32 assetId) external view returns (bool) {
        return (collateral[assetId].amount < computeMinCollateralAmount(assetId));
    }

    function isInFinalState(bytes32 assetId) internal view returns (bool) {
        require(
            assetRegistry.isRegistered(assetId) == true,
            "Collateral.claimCollateral: ASSET_DOES_NOT_EXIST"
        );

        // check if asset has matured, was terminated or did already default
        ContractPerformance performance = ContractPerformance(
            assetRegistry.getEnumValueForTermsAttribute(assetId, "contractPerformance")
        );
        
        return (
            performance == ContractPerformance.PF
            || performance == ContractPerformance.DL
            || performance == ContractPerformance.DQ
        );
    }
}
