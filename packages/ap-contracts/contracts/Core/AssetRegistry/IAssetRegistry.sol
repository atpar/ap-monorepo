pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "./AssetRegistryStorage.sol";


abstract contract IAssetRegistry is AssetRegistryStorage {

    function isRegistered(bytes32 assetId)
        external
        view
        virtual
        returns (bool);

    function setCreatorObligor (bytes32 assetId, address newCreatorObligor)
        external
        virtual;

    function setCounterpartyObligor (bytes32 assetId, address newCounterpartyObligor)
        external
        virtual;

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

    function getEngine(bytes32 assetId)
        external
        view
        virtual
        returns (address);

    function getActor(bytes32 assetId)
        external
        view
        virtual
        returns (address);

    function getTemplateId(bytes32 assetId)
        external
        view
        virtual
        returns (bytes32);

    function getPendingEvent (bytes32 assetId)
        external
        view
        virtual
        returns (bytes32);

    function pushPendingEvent (bytes32 assetId, bytes32 pendingEvent)
        external
        virtual;

    function popPendingEvent (bytes32 assetId)
        external
        virtual
        returns (bytes32);

    function getNextUnderlyingEvent (bytes32 assetId)
        external
        view
        virtual
        returns (bytes32);

    function getNextScheduleIndex(bytes32 assetId)
        external
        view
        virtual
        returns (uint256);

    function getNextScheduledEvent (bytes32 assetId)
        external
        view
        virtual
        returns (bytes32);

    function popNextScheduledEvent(bytes32 assetId)
        external
        virtual
        returns (bytes32);

    function isEventSettled(bytes32 assetId, bytes32 _event)
        external
        view
        virtual
        returns (bool);

    function markEventAsSettled(bytes32 assetId, bytes32 _event)
        external
        virtual;

    function setState(bytes32 assetId, State calldata state)
        external
        virtual;

    function setFinalizedState(bytes32 assetId, State calldata state)
        external
        virtual;

    function setCustomTerms(bytes32 assetId, CustomTerms calldata terms)
        external
        virtual;
    
    function setAnchorDate(bytes32 assetId, uint256 anchorDate)
        external
        virtual;

    function setEngine(bytes32 assetId, address engine)
        external
        virtual;

    function setActor(bytes32 assetId, address actor)
        external
        virtual;

    function registerAsset(
        bytes32 assetId,
        AssetOwnership calldata ownership,
        bytes32 templateId,
        CustomTerms calldata customTerms,
        State calldata state,
        address engine,
        address actor,
        address root
    )
        external
        virtual;

    function grantAccess(bytes32 assetId, bytes4 methodSignature, address account)
        external
        virtual;

    function revokeAccess(bytes32 assetId, bytes4 methodSignature, address account)
        external
        virtual;

    function hasAccess(bytes32 assetId, bytes4 methodSignature, address account)
        public
        virtual
        returns (bool);

    function hasRootAccess(bytes32 assetId, address account)
        public
        virtual
        returns (bool);
}
