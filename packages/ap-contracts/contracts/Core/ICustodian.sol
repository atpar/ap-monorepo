pragma solidity ^0.5.2;


interface ICustodian {

	function lockCollateral(
		bytes32 collateralId,
		uint256 collateralAmount,
		address collateralizer,
		address collateralToken
	)
		external
		returns (bool);
}