pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./AssetRegistryStorage.sol";


contract IAssetRegistry is AssetRegistryStorage {

    function setCreatorBeneficiary(bytes32 assetId, address newCreatorBeneficiary) external;

    function setCounterpartyBeneficiary(bytes32 assetId, address newCounterpartyBeneficiary) external;

    function setBeneficiaryForCashflowId(bytes32 assetId, int8 cashflowId, address beneficiary) external;

    function getOwnership(bytes32 assetId) external view returns (AssetOwnership memory);

    function getCashflowBeneficiary(bytes32 assetId, int8 cashflowId) external view returns (address);

    function getTerms(bytes32 assetId) external view returns (LifecycleTerms memory);

    function getState(bytes32 assetId) external view returns (State memory);

    function getFinalizedState(bytes32 assetId) external view returns (State memory);

    function getAnchorDate(bytes32 assetId) external view returns (uint256);

    function getEngineAddress(bytes32 assetId) external view returns (address);

    function getActorAddress(bytes32 assetId) external view returns (address);

    function getProductId(bytes32 assetId) external view returns (bytes32);

    function getNextEvent (bytes32 assetId) external view returns (bytes32);

    function getScheduleIndex(bytes32 assetId, uint8 scheduleId) external view returns (uint256);

    function incrementScheduleIndex(bytes32 assetId, uint8 scheduleId) external;

    function setState(bytes32 assetId, State memory state) public;

    function setFinalizedState(bytes32 assetId, State memory state) public;

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
