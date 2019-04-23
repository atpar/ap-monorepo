pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../APCore/APDefinitions.sol";
import "./VerifyOrder.sol";
import "../APExtended/IAssetActor.sol";


contract AssetIssuer is APDefinitions, VerifyOrder {

	event AssetIssued(bytes32 indexed assetId, address indexed recordCreator, address indexed counterparty);

	/**
	 * issues an asset from an order which was signed by the maker and taker
	 * @dev verifies both signatures and calls the init code defined in the actor contract
	 * @param order order for which to issue the asset
	 * @param makerSignature signature of the maker of the order
	 * @param takerSignature signature of the taker of the order
	 */
	function fillOrder(
		Order memory order,
		bytes memory makerSignature,
		bytes memory takerSignature
	)
		public
	{
		require(
			assertOrderSignatures(order, makerSignature, takerSignature),
			"INVALID_SIGNATURE: Order signatures are invalid!"
		);

		bytes32 assetId = keccak256(
			abi.encode(makerSignature, takerSignature)
		);
		AssetOwnership memory ownership = AssetOwnership(
			order.maker,
			order.maker,
			order.taker,
			order.taker
		);

		require(
			IAssetActor(order.actor).initialize(assetId, ownership, order.terms),
			"EXECUTION_ERROR: Initialization failed"
		);

		emit AssetIssued(assetId, order.maker, order.taker);
	}
}
