pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "../Core/AssetRegistry/IAssetRegistry.sol";
import "./ICustodian.sol";


/**
 * @title Custodian
 * @notice Contract which holds the collateral of CEC (Credit Enhancement Collateral) assets.
 */
contract Custodian is ICustodian, ReentrancyGuard {

    event LockedCollateral(bytes32 indexed assetId, address collateralizer, uint256 collateralAmount);

    event ReturnedCollateral(bytes32 indexed assetId, address collateralizer, uint256 returnedAmount);

    address public assetActor;
    IAssetRegistry public assetRegistry;

    mapping(bytes32 => bool) collateral;

    using SafeMath for uint256;


    constructor(address _assetActor, IAssetRegistry _assetRegistry) public {
        assetActor = _assetActor;
        assetRegistry = _assetRegistry;
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
        LifecycleTerms memory terms,
        AssetOwnership memory ownership
    )
        public
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

        require(
            IERC20(collateralToken).allowance(collateralizer, address(this)) >= collateralAmount,
            "Custodian.lockCollateral: INSUFFICIENT_ALLOWANCE"
        );

        // try transferring collateral from collateralizer to the custodian
        require(
            IERC20(collateralToken).transferFrom(collateralizer, address(this), collateralAmount),
            "Custodian.lockCollateral: TRANSFER_FAILED"
        );

        // set allowance for AssetActor to later transfer collateral when XD is triggered
        uint256 allowance = IERC20(collateralToken).allowance(address(this), assetActor);
        require(
            IERC20(collateralToken).approve(assetActor, allowance.add(collateralAmount)),
            "Custodian.lockCollateral: INCREASING_ALLOWANCE_FAILED"
        );

        // register collateral for assetId
        collateral[assetId] = true;

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
        public
        returns (bool)
    {
        require(
            collateral[assetId] == true,
            "Custodian.returnCollateral: ENTRY_DOES_NOT_EXIST"
        );

        LifecycleTerms memory terms = assetRegistry.getTerms(assetId);
        State memory state = assetRegistry.getState(assetId);
        AssetOwnership memory ownership = assetRegistry.getOwnership(assetId);

        // derive address of collateralizer
        address collateralizer = (terms.contractRole == ContractRole.BUY)
            ? ownership.counterpartyBeneficiary
            : ownership.creatorBeneficiary;

        // decode token address and amount of collateral
        (address collateralToken, uint256 collateralAmount) = decodeCollateralObject(terms.contractReference_2.object);

        // calculate amount to return
        uint256 notExecutedAmount;
        // if XD was triggerd
        if (state.executionDate > uint256(0)) {
            notExecutedAmount = collateralAmount.sub(
                (state.executionAmount >= 0) ? uint256(state.executionAmount) : uint256(-1 * state.executionAmount)
            );
        // if XD was not triggered and reached maturity
        } else if (state.executionDate == uint256(0) && state.statusDate >= state.maturityDate) {
            notExecutedAmount = collateralAmount;
        // throw if XD was not triggered and maturity is not reached
        } else {
            revert("Custodian.returnCollateral: COLLATERAL_CAN_NOT_BE_RETURNED");
        }

        // reset allowance for AssetActor
        uint256 allowance = IERC20(collateralToken).allowance(address(this), assetActor);
        require(
            IERC20(collateralToken).approve(assetActor, allowance.sub(notExecutedAmount)),
            "Custodian.returnCollateral: DECREASING_ALLOWANCE_FAILD"
        );

        // try transferring amount back to the collateralizer
        require(
            IERC20(collateralToken).transfer(collateralizer, notExecutedAmount),
            "Custodian.returnCollateral: TRANSFER_FAILED"
        );

        emit ReturnedCollateral(assetId, collateralizer, notExecutedAmount);

        return true;
    }
}