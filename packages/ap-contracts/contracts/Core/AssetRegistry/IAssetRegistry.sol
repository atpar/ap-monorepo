pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./AssetRegistryStorage.sol";


contract IAssetRegistry is AssetRegistryStorage {

	function setRecordCreatorBeneficiary(bytes32 assetId, address newRecordCreatorBeneficiary) external;

	function setCounterpartyBeneficiary(bytes32 assetId, address newCounterpartyBeneficiary) external;

	function setBeneficiaryForCashflowId(bytes32 assetId, int8 cashflowId, address beneficiary) external;

	function getOwnership(bytes32 assetId) external view returns (AssetOwnership memory);

	function getCashflowBeneficiary(bytes32 assetId, int8 cashflowId) external view returns (address);

	function getTerms(bytes32 assetId) external view returns (LifecycleTerms memory);

	function getState(bytes32 assetId) external view returns (State memory);

	function getFinalizedState(bytes32 assetId) external view returns (State memory);

	function getEngineAddress(bytes32 assetId) external view returns (address);

	function getNextNonCyclicEvent(bytes32 assetId) external view returns (bytes32);

	function getNextCyclicEvent(bytes32 assetId, EventType eventType) external view returns (bytes32);

	function getNonCyclicScheduleIndex(bytes32 assetId) external view returns (uint256);

	function getCyclicScheduleIndex(bytes32 assetId, EventType eventType) external view returns (uint256);

	function getAnchorDate(bytes32 assetId) external view returns (uint256);

	function setState(bytes32 assetId, State memory state) public;

	function setFinalizedState(bytes32 assetId, State memory state) public;

	function setNonCyclicEventIndex(bytes32 assetId, uint256 nextIndex) public;

	function setCyclicEventIndex(bytes32 assetId, EventType eventType, uint256 nextIndex) public;

	function registerAsset(
		bytes32 assetId,
		AssetOwnership memory ownership,
		bytes32 productId,
		CustomTerms memory customTerms,
		State memory state,
		address engine,
		address actor
	)
		public;
}
