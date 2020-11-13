// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "../../ACTUS/Core/Utils/EventUtils.sol";
import "../../ACTUS/Core/SignedMath.sol";

import "../../Core/Base/AssetRegistry/IAssetRegistry.sol";
import "../../Core/Base/Conversions.sol";
import "../IExtension.sol";


/**
 * @title Custodian
 * @notice Contract which holds the collateral of CEC (Credit Enhancement Collateral) assets.
 */
contract CustodianExtension is EventUtils, Conversions, IExtension {

    using SafeMath for uint256;
    using SignedMath for int256;

    event AddedCollateral(bytes32 indexed assetId, address collateralizer, uint256 collateralAmount);
    event WithdrewCollateral(bytes32 indexed assetId, address collateralizer, uint256 withdrawnAmount);
    event ClaimedCollateral(bytes32 indexed assetId, address creditor, uint256 claimedAmount);

    IAssetRegistry public assetRegistry;

    struct Collateral {
        uint256 amount;
        uint256 claimableAmount;
    }

    // assetId => collateral
    mapping(bytes32 => Collateral) internal collateral;


    constructor(IAssetRegistry _assetRegistry) {
        assetRegistry = _assetRegistry;
    }

    function onProgress(bytes32 assetId) external override returns (bytes32) {
        require(
            assetRegistry.isRegistered(assetId) == true,
            "Collateral.addCollateral: ASSET_DOES_NOT_EXIST"
        );

        if (isInFinalState(assetId) == false || collateral[assetId].amount >= computeMinCollateralAmount(assetId)) {
            return bytes32(0);
        }

        // set claimable amount at time of default (assuming := time of progress)
        collateral[assetId].claimableAmount = computeMinCollateralAmount(assetId);

        return encodeEvent(EventType.CE, block.timestamp);
    }

    /**
     * @notice Locks the required collateral amount encoded in the second contract
     * reference in the terms.
     * @dev The collateralizer has to set allowance beforehand. The custodian increases
     * allowance for the AssetActor by amount of collateral
     * @param assetId id of the asset with collateral requirements
     * @param addAmount top up amount
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

        address collateralToken = assetRegistry.getAddressValueForTermsAttribute(assetId, "currency");

        require(
            IERC20(collateralToken).allowance(msg.sender, address(this)) >= addAmount,
            "Custodian.addCollateral: INSUFFICIENT_ALLOWANCE"
        );

        // try transferring collateral from msg.sender to the custodian
        require(
            IERC20(collateralToken).transferFrom(msg.sender, address(this), addAmount),
            "Custodian.addCollateral: TRANSFER_FAILED"
        );

        // register collateral for assetId
        collateral[assetId].amount = collateral[assetId].amount.add(addAmount);

        emit AddedCollateral(assetId, msg.sender, addAmount);
    }

    function withdrawCollateral(bytes32 assetId, uint256 withdrawAmount) external {
        require(
            assetRegistry.isRegistered(assetId) == true,
            "Collateral.withdrawCollateral: ASSET_DOES_NOT_EXIST"
        );

        (address collateralizer, ) = deriveCollateralizerAndCreditor(assetId);
        
        require(
            collateral[assetId].amount.sub(withdrawAmount) >= computeMinCollateralAmount(assetId)
            || ContractPerformance(
                assetRegistry.getEnumValueForTermsAttribute(assetId, "contractPerformance")
            ) == ContractPerformance.MD,
            "Collateral.withdrawCollateral: INSUFFICIENT_COLLATERAL_RATIO"
        );

        address collateralToken = assetRegistry.getAddressValueForTermsAttribute(assetId, "currency");
        require(
            IERC20(collateralToken).transfer(collateralizer, withdrawAmount),
            "Custodian.withdrawCollateral: TRANSFER_FAILED"
        );

        // register collateral for assetId
        collateral[assetId].amount = collateral[assetId].amount.sub(withdrawAmount);

        emit WithdrewCollateral(assetId, collateralizer, withdrawAmount);
    }

    function claimCollateral(bytes32 assetId) external {
        require(
            assetRegistry.isRegistered(assetId) == true,
            "Collateral.claimCollateral: ASSET_DOES_NOT_EXIST"
        );

        uint256 claimableAmount = collateral[assetId].claimableAmount;

        require(
            claimableAmount >= 0,
            "Collateral.claimCollateral: NOTHING_CLAIM"
        );

        (, address creditor) = deriveCollateralizerAndCreditor(assetId);

        address collateralToken = assetRegistry.getAddressValueForTermsAttribute(assetId, "currency");
        require(
            IERC20(collateralToken).transfer(creditor, claimableAmount),
            "Custodian.claimCollateral: TRANSFER_FAILED"
        );

        collateral[assetId].claimableAmount = 0;

        emit ClaimedCollateral(assetId, creditor, claimableAmount);
    }

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
        ContractRole contractRole = ContractRole(assetRegistry.getEnumValueForTermsAttribute(assetId, "contractRole"));
        require (
            contractRole == ContractRole.BUY || contractRole == ContractRole.SEL,
            "Collateral.claimCollateral: INVALID_CONTRACT_ROLE"
        );

        AssetOwnership memory ownership = assetRegistry.getOwnership(assetId);

        (collateralizer, creditor) = (contractRole == ContractRole.BUY)
            ? (ownership.counterpartyObligor, ownership.creatorBeneficiary)
            : (ownership.creatorObligor, ownership.counterpartyBeneficiary);
    }

    function computeMinCollateralAmount(bytes32 assetId) public view returns (uint256) {
        require(
            assetRegistry.isRegistered(assetId) == true,
            "Collateral.claimCollateral: ASSET_DOES_NOT_EXIST"
        );

        // todo: if collateral token != asset currency --> determine value
        int256 coverage = assetRegistry.getIntValueForTermsAttribute(assetId, "coverageOfCreditEnhancement");
        int256 principal = assetRegistry.getIntValueForTermsAttribute(assetId, "notionalPrincipal");
        return uint256(principal.floatMult(coverage));
    }

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
