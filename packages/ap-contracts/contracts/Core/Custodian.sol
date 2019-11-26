pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";

import "./ICustodian.sol";


contract Custodian is ICustodian, ReentrancyGuard {

	address public assetIssuer;
	address public assetActor;

	mapping(bytes32 => uint256) collateral;


	constructor(address _assetActor) public {
		assetActor = _assetActor;
	}

	function lockCollateral(
		bytes32 collateralId,
		uint256 collateralAmount,
		address collateralizer,
		address collateralToken
	)
		external
		returns (bool)
	{
		require(
			IERC20(collateralToken).allowance(collateralizer, address(this)) >= collateralAmount,
			"Custodian.lockCollateral: INSUFFICIENT_ALLOWANCE"
		);

		// try transferring collateral from collateralizer to the custodian
		require(
			IERC20(collateralToken).transferFrom(collateralizer, address(this), collateralAmount),
			"Custodian.lockCollateral: TRANFER_FAILED"
		);

		require(
			IERC20(collateralToken).approve(assetActor, collateralAmount),
			"Custodian.lockCollateral: APPROVEMENT_FAILED"
		);

		// register collateral for assetId
		collateral[collateralId] = collateralAmount;

		return true;
	}
}