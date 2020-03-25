pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "./AssetRegistryStorage.sol";


abstract contract IAssetRegistry is AssetRegistryStorage {

    function setCreatorBeneficiary(bytes32 assetId, address newCreatorBeneficiary)
        external
        virtual;

    function setCounterpartyBeneficiary(bytes32 assetId, address newCounterpartyBeneficiary)
        external
        virtual;

    function setBeneficiaryForCashflowId(bytes32 assetId, int8 cashflowId, address beneficiary)
        external
        virtual;

    function getOwnership(bytes32 assetId)
        external
        view
        virtual
        returns (AssetOwnership memory);

    function getCashflowBeneficiary(bytes32 assetId, int8 cashflowId)
        external
        view
        virtual
        returns (address);

    function getTerms(bytes32 assetId)
        external
        view
        virtual
        returns (LifecycleTerms memory);

    function getState(bytes32 assetId)
        external
        view
        virtual
        returns (State memory);

    function getFinalizedState(bytes32 assetId)
        external
        view
        virtual
        returns (State memory);

    function getAnchorDate(bytes32 assetId)
        external
        view
        virtual
        returns (uint256);

    function getEngineAddress(bytes32 assetId)
        external
        view
        virtual
        returns (address);

    function getActorAddress(bytes32 assetId)
        external
        view
        virtual
        returns (address);

    function getTemplateId(bytes32 assetId)
        external
        view
        virtual
        returns (bytes32);

    function getNextEvent (bytes32 assetId)
        external
        view
        virtual
        returns (bytes32);

    function getNextScheduleIndex(bytes32 assetId)
        external
        view
        virtual
        returns (uint256);

    function incrementScheduleIndex(bytes32 assetId)
        external
        virtual;

    function setState(bytes32 assetId, State memory state)
        public
        virtual;

    function setFinalizedState(bytes32 assetId, State memory state)
        public
        virtual;

    function registerAsset(
        bytes32 assetId,
        AssetOwnership memory ownership,
        bytes32 templateId,
        CustomTerms memory customTerms,
        State memory state,
        address engine,
        address actor
    )
        public
        virtual;
}
