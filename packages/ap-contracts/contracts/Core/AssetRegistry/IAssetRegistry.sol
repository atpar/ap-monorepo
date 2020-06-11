pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "./AccessControl/IAccessControl.sol";
import "./Terms/ITermsRegistry.sol";
import "./State/IStateRegistry.sol";
import "./Schedule/IScheduleRegistry.sol";
import "./Ownership/IOwnershipRegistry.sol";


interface IAssetRegistry is
    IAccessControl,
    ITermsRegistry,
    IStateRegistry,
    IScheduleRegistry,
    IOwnershipRegistry
{

    function isRegistered(bytes32 assetId)
        external
        view
        returns (bool);

    function registerAsset(
        bytes32 assetId,
        PAMTerms calldata terms,
        State calldata state,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address actor,
        address root
    )
        external;

    function getEngine(bytes32 assetId)
        external
        view
        returns (address);

    function getActor(bytes32 assetId)
        external
        view
        returns (address);

    function setEngine(bytes32 assetId, address engine)
        external;

    function setActor(bytes32 assetId, address actor)
        external;
}
