pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "@atpar/actus-solidity/contracts/Core/Utils.sol";

import "../TemplateRegistry/ITemplateRegistry.sol";
import "../Conversions.sol";
import "../SharedTypes.sol";

import "./StateEncoder.sol";
import "./PAMEncoder.sol";


/**
 * @title AssetRegistryStorage
 * @notice Describes the storage of the AssetRegistry
 * Contains getter and setter methods for encoding, decoding data to optimize gas cost.
 * Circumvents storing default values by relying on the characteristic of mappings returning zero for not set values.
 */
contract AssetRegistryStorage is SharedTypes, Utils, Conversions {

    using PAMEncoder for Asset;
    using StateEncoder for Asset;

    struct Settlement {
        bool isSettled;
        int256 payoff;
    }

    struct Asset {
        // boolean indicating that asset exists / is registered
        bool isSet;
        // address of the ACTUS Engine used for computing the State and the Payoff of the asset
        address engine;
        // address of the Asset Actor which is allowed to update the State of the asset
        address actor;
        // schedule of the asset
        Schedule schedule;
        // ownership of the asset
        AssetOwnership ownership;
        // granular ownership of the event type specific cashflows
        // per default owners are beneficiaries defined in ownership object
        // cashflow id (:= (EventType index + 1) * direction) => owner
        mapping (int8 => address) cashflowBeneficiaries;
        // method level access control - stores which address can a specific method
        // method signature => address => has access
        mapping (bytes4 => mapping (address => bool)) access;
        // tightly packed, encoded Terms and State values of the asset
        // bytes32(0) used as default value for each attribute
        // storage id => bytes32 encoded value
        mapping (bytes32 => bytes32) packedTerms;
        // tightly packed, encoded Terms and State values of the asset
        // bytes32(0) used as default value for each attribute
        // storage id => bytes32 encoded value
        mapping (bytes32 => bytes32) packedState;
        // indicates whether a specific event was settled
        mapping (bytes32 => Settlement) settlement;
    }

    // AssetId => Asset
    mapping (bytes32 => Asset) internal assets;


    /**
     * @notice Stores the addresses of the owners (owner of creator-side payment obligations,
     * owner of creator-side payment claims), the initial state of an asset
     * and sets the address of the actor (address of account which is allowed to update the state).
     * @dev The state of the asset can only be updates by a whitelisted actor.
     * @param assetId id of the asset
     * @param ownership ownership of the asset
     * @param state initial state of the asset
     * @param engine ACTUS Engine of the asset
     * @param actor account which is allowed to update the asset state
     * @param admin account which as admin rights (optional)
     */
    function setAsset(
        bytes32 _assetId,
        AssetOwnership memory _ownership,
        State memory state,
        address _engine,
        address _actor
    )
        internal
    {
        Asset storage asset = assets[_assetId];

        // revert if an asset with the specified assetId already exists
        require(
            asset.isSet == false,
            "AssetRegistry.setAsset: ASSET_ALREADY_EXISTS"
        );

        asset.isSet = true;
        asset.templateId = _templateId;
        asset.engine = _engine;
        asset.actor = _actor;
        asset.ownership = _ownership;

        asset.encodeAndSetState(state);
        asset.encodeAndSetFinalizedState(state);

        // set external admin if specified
        if (admin != address(0)) {
            setDefaultRoot(assetId, admin);
        }

        emit RegisteredAsset(assetId);
    }
}
