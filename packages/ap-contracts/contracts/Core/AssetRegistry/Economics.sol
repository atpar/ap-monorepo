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
	function getTerms(bytes32 assetId) external view returns (ContractTerms memory) {
		return assets[assetId].terms;
	}

	/**
	 * returns the state of a registered asset
	 * @param assetId id of the asset
	 * @return state of the asset
	 */
	function getState(bytes32 assetId) external view returns (ContractState memory) {
		return assets[assetId].state;
	}

	/**
	 * returns the last event id of a registered asset
	 * @param assetId id of the asset
	 * @return last event id
	 */
	function getEventId(bytes32 assetId) external view returns (uint256) {
		return assets[assetId].eventId;
	}

	/**
	 * sets next state of a registered asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param state next state of the asset
	 */
	function setState(bytes32 assetId, ContractState memory state) public onlyDesignatedActor (assetId) {
		assets[assetId].state = state;
	}

	/**
	 * sets new terms for a registered asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param terms new terms of the asset
	 */
	function setTerms(bytes32 assetId, ContractTerms memory terms) public onlyDesignatedActor (assetId) {
		assets[assetId].terms = terms;
	}

	/**
	 * sets the last event id for a registered asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param eventId the last event id
	 */
	function setEventId(bytes32 assetId, uint256 eventId) public onlyDesignatedActor (assetId) {
		assets[assetId].eventId = eventId;
	}
}