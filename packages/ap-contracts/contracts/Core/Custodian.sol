pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./AssetRegistry/IAssetRegistry.sol";
import "./ICustodian.sol";


contract Custodian is ICustodian, ReentrancyGuard {

	address public assetActor;
	IAssetRegistry public assetRegistry;

	mapping(bytes32 => bool) collateral;

	using SafeMath for uint256;


	constructor(address _assetActor, IAssetRegistry _assetRegistry) public {
		assetActor = _assetActor;
		assetRegistry = _assetRegistry;
	}

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

		return true;
	}

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
		if (state.executionDate > uint256(0)) { // executionDate?
			notExecutedAmount = collateralAmount.sub(uint256(state.executionAmount));
		// if XD was not triggered and reached maturity
		} else if (state.executionDate == uint256(0) && state.statusDate >= state.maturityDate) {
			notExecutedAmount = collateralAmount;
		// throw if XD was not triggered and maturity is not reached
		} else {
			revert("Custodian.returnCollateral: COLLATERAL_CAN_NOT_BE_RETURNED");
		}

		// reset allowance for AssetActor
		// uint256 allowance = IERC20(collateralToken).allowance(address(this), assetActor);
		// require(
		// 	IERC20(collateralToken).approve(assetActor, allowance.sub(collateralAmount)),
		// 	"Custodian.returnCollateral: DECREASING_ALLOWANCE_FAILD"
		// );

		// try transferring amount back to the collateralizer
		require(
			IERC20(collateralToken).transfer(collateralizer, notExecutedAmount),
			"Custodian.returnCollateral: TRANSFER_FAILED"
		);

		return true;
	}
}