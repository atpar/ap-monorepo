pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./AssetRegistryStorage.sol";


contract Economics is AssetRegistryStorage {

	modifier onlyDesignatedActor(bytes32 assetId) {
		require(
			assets[assetId].actor == msg.sender,
			"AssetRegistry.onlyDesignatedActor: UNAUTHORIZED_SENDER"
		);
		_;
	}

	/**
	 * returns the terms of a registered asset
	 * @param assetId id of the asset
	 * @return terms of the asset
	 */
	function getTerms(bytes32 assetId) external view returns (LifecycleTerms memory) {
		return productRegistry.getProductTerms(assets[assetId].productId);
	}

	/**
	 * returns the state of a registered asset
	 * @param assetId id of the asset
	 * @return state of the asset
	 */
	function getState(bytes32 assetId) external view returns (State memory) {
		return decodeAndGetState(assetId);
	}

	/**
	 * returns the finalized state of a registered asset
	 * @param assetId id of the asset
	 * @return state of the asset
	 */
	function getFinalizedState(bytes32 assetId) external view returns (State memory) {
		return decodeAndGetFinalizedState(assetId);
	}

	function getNextNonCyclicProtoEvent(bytes32 assetId) external view returns (bytes32) {
		if (productRegistry.getNonCyclicProtoEventScheduleLength(assets[assetId].productId) == 0) {
			return bytes32(0);
		}

		return productRegistry.getNonCyclicProtoEventAtIndex(
			assets[assetId].productId,
			assets[assetId].nextProtoEventIndex[NON_CYCLIC_INDEX]
		);
	}

	function getNextCyclicProtoEvent(bytes32 assetId, EventType eventType) external view returns (bytes32) {
		if (productRegistry.getCyclicProtoEventScheduleLength(assets[assetId].productId, eventType) == 0) {
			return bytes32(0);
		}

		return productRegistry.getCyclicProtoEventAtIndex(
			assets[assetId].productId,
			eventType,
			assets[assetId].nextProtoEventIndex[uint8(eventType)]
		);
	}

	function getNonCyclicProtoEventScheduleIndex(bytes32 assetId) external view returns (uint256) {
		return assets[assetId].nextProtoEventIndex[NON_CYCLIC_INDEX];
	}

	function getCyclicProtoEventScheduleIndex(bytes32 assetId, EventType eventType) external view returns (uint256) {
		return assets[assetId].nextProtoEventIndex[uint8(eventType)];
	}

  /**
	 * returns the address of a the ACTUS engine corresponding to the ContractType of a registered asset
	 * @param assetId id of the asset
	 * @return address of the ACTUS engine
	 */
	function getEngineAddress(bytes32 assetId) external view returns (address) {
		return assets[assetId].engine;
	}

	/**
	 * sets next state of a registered asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param state next state of the asset
	 */
	function setState(bytes32 assetId, State memory state) public onlyDesignatedActor (assetId) {
		encodeAndSetState(assetId, state);
	}

	/**
	 * sets next finalized state of a registered asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param state next state of the asset
	 */
	function setFinalizedState(bytes32 assetId, State memory state) public onlyDesignatedActor (assetId) {
		encodeAndSetFinalizedState(assetId, state);
	}

	function setNonCyclicProtoEventIndex(bytes32 assetId, uint256 nextIndex) public onlyDesignatedActor (assetId) {
		require(
			productRegistry.getNonCyclicProtoEventScheduleLength(assets[assetId].productId) > nextIndex,
			"AssetRegistry.setNonCyclicProtoEventIndex: OUT_OF_BOUNDS"
		);

		assets[assetId].nextProtoEventIndex[NON_CYCLIC_INDEX]++;
	}

	function setCyclicProtoEventIndex(
		bytes32 assetId,
		EventType eventType,
		uint256 nextIndex
	)
		public
		onlyDesignatedActor (assetId)
	{
		require(
			productRegistry.getCyclicProtoEventScheduleLength(assets[assetId].productId, eventType) > nextIndex,
			"AssetRegistry.setNonCyclicProtoEventIndex: OUT_OF_BOUNDS"
		);

		assets[assetId].nextProtoEventIndex[NON_CYCLIC_INDEX]++;
	}
}
