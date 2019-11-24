pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";


contract Custodian is ReentrancyGuard {

	address public assetIssuer;
	address public assetActor;

	mapping(bytes32 => uint256) collateral;


	constructor(address _assetActor, address _assetIssuer) public {
		assetIssuer = _assetIssuer;
		assetActor = _assetActor;
	}

	function lockCollateral(
		bytes32 assetId,
		uint256 collateralAmount,
		address collateralizer,
		address collateralToken
	)
		external
		returns (bool)
	{
		require(
			msg.sender == assetIssuer,
			"Custodian.lockCollateral: UNAUTHORIZED_SENDER"
		);

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
		collateral[assetId] = collateralAmount;

		return true;
	}

	// function payoutCollateral(
	// 	bytes32 assetId,
	// 	address collateralRecipient,
	// 	address collateralToken
	// )
	// 	external
	// 	nonReentrant
	// 	returns (bool)
	// {
	// 	require(
	// 		msg.sender == assetActor,
	// 		"Custodian.payoutCollateral: UNAUTHORIZED_SENDER"
	// 	);

	// 	if (collateral[assetId] == uint256(0)) return true;

	// 	return IERC20(collateralToken).transferFrom(
	// 		address(this),
	// 		collateralRecipient,
	// 		collateral[assetId]
	// 	);
	// }
}