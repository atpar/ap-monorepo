pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../Core/AssetRegistry/IAssetRegistry.sol";

import "funds-distribution-token/contracts/extensions/FDT_ETHExtension.sol";
import "funds-distribution-token/contracts/extensions/FDT_ERC20Extension.sol";

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";


contract TokenizationFactory {

	IAssetRegistry assetRegistry;
	address paymentRouter;


	event DeployedDistributor(address distributor, address creator);

	constructor(
		IAssetRegistry _assetRegistry,
		address _paymentRouter
	) public {
		assetRegistry = _assetRegistry;
		paymentRouter = _paymentRouter;
	}

	function createETHDistributor(
		string memory name,
		string memory symbol,
		uint256 initialSupply
	)
		public
	{
		FDT_ETHExtension distributor = new FDT_ETHExtension(name, symbol);

		require(
			distributor.mint(msg.sender, initialSupply),
			"TokenizationFactory.createETHDistributor: Could not mint initial supply"
		);

		emit DeployedDistributor(address(distributor), msg.sender);
	}

	function createERC20Distributor(
		string memory name,
		string memory symbol,
		uint256 initialSupply,
		IERC20 token
	)
		public
	{
		FDT_ERC20Extension distributor = new FDT_ERC20Extension(name, symbol, token);

		require(
			distributor.mint(msg.sender, initialSupply),
			"TokenizationFactory.createERC20Distributor: Could not mint initial supply"
		);

		emit DeployedDistributor(address(distributor), msg.sender);
	}
}