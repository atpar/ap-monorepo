pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/utils/ReentrancyGuard.sol";

import "actus-solidity/contracts/Core/Definitions.sol";

import "./AssetRegistry/IAssetRegistry.sol";
import "./SharedTypes.sol";

contract Custodian is Definitions, SharedTypes, ReentrancyGuard {

	IAssetRegistry public assetRegistry;
	address public assetIssuer;

	mapping(bytes32 => uint256) collateral;


	constructor(IAssetRegistry _assetRegistry, address _assetIssuer) public {
		assetRegistry = _assetRegistry;
		assetIssuer = _assetIssuer;
	}

	function lockCollateral(
		bytes32 assetId,
		LifecycleTerms memory terms,
		AssetOwnership memory ownership
	)
		external
		returns (bool)
	{
		require(
			msg.sender == assetIssuer,
			"Custodian.lockCollateral: UNAUTHORIZED_SENDER"
		);

		address collateralizer = (terms.contractRole == ContractRole.RPA)
			? ownership.creatorObligor
			: ownership.counterpartyObligor;

		require(
			IERC20(terms.currency).allowance(collateralizer) >= terms.,
			"Custodian.lockCollateral: INSUFFICIENT_FUNDS"
		);

		IERC20(terms.currency).transferFrom(collateralizer, address(this), terms.notionalPrincipal);

		collateral[assetId] = terms.;
	}

	function payoutCollateral(bytes32 assetId) external nonReentrant {
		AssetOwnership memory ownership = assetRegistry.getOwnership(assetId);
		LifecycleTerms memory terms = assetRegistry.getTerms(assetId);
		State memory state = assetRegistry.getState(assetId);

		require(
			collateral[assetId] >= uint256(0),
			"Custodian.payoutCollateral: ENTY_NOT_FOUND"
		);

		if (state.contractPerformance == ContractPerformance.DF) {
			IERC20(terms.currency).transferFrom(
				address(this),
				(terms.contractRole == ContractRole.RPA) ? ownership.creatorBeneficiary : ownership.counterpartyBeneficiary,
				collateral[assetId]
			);
		} else if (state.maturityDate <= block.timestamp) {
			IERC20(terms.currency).transferFrom(
				address(this),
				(terms.contractRole == ContractRole.RPA) ? ownership.counterpartyBeneficiary : ownership.creatorBeneficiary,
				collateral[assetId]
			);
		}
	}
}