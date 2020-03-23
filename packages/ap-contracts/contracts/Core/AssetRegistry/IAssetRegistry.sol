pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./AssetRegistryStorage.sol";


contract IAssetRegistry is AssetRegistryStorage {

    function setCreatorObligor (bytes32 assetId, address newCreatorObligor) external;

    function setCounterpartyObligor (bytes32 assetId, address newCounterpartyObligor) external;

    function setCreatorBeneficiary(bytes32 assetId, address newCreatorBeneficiary) external;

    function setCounterpartyBeneficiary(bytes32 assetId, address newCounterpartyBeneficiary) external;

    function setBeneficiaryForCashflowId(bytes32 assetId, int8 cashflowId, address beneficiary) external;

    function getOwnership(bytes32 assetId) external view returns (AssetOwnership memory);

    function getCashflowBeneficiary(bytes32 assetId, int8 cashflowId) external view returns (address);

    function getTerms(bytes32 assetId) external view returns (LifecycleTerms memory);

    function getState(bytes32 assetId) external view returns (State memory);

    function getFinalizedState(bytes32 assetId) external view returns (State memory);

    function getAnchorDate(bytes32 assetId) external view returns (uint256);

    function getEngine(bytes32 assetId) external view returns (address);

    function getActor(bytes32 assetId) external view returns (address);

    function getTemplateId(bytes32 assetId) external view returns (bytes32);

    function getNextEvent (bytes32 assetId) external view returns (bytes32);

    function getNextScheduleIndex(bytes32 assetId) external view returns (uint256);

    function incrementScheduleIndex(bytes32 assetId) external;

    function setCustomTerms(bytes32 assetId, CustomTerms memory terms) public;

    function setState(bytes32 assetId, State memory state) public;

    function setFinalizedState(bytes32 assetId, State memory state) public;
    
    function setAnchorDate(bytes32 assetId, uint256 anchorDate) public;

    function setEngine(bytes32 assetId, address engine) public;

    function setActor(bytes32 assetId, address actor) public;

    function registerAsset(
        bytes32 assetId,
        AssetOwnership memory ownership,
        bytes32 templateId,
        CustomTerms memory customTerms,
        State memory state,
        address engine,
        address actor
    )
        public;

    function checkAccess (bytes32 assetId, bytes4 methodSignature, address account) public returns (bool);

    function grantAccess (bytes32 assetId, bytes4 methodSignature, address account) public;

    function revokeAccess (bytes32 assetId, bytes4 methodSignature, address account) public;
}
