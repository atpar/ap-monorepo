// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../SharedTypes.sol";


struct Settlement {
    bool isSettled;
    int256 payoff;
}

// Method signature == bytes4(0) := Access to all methods defined in the Asset Registry contract
bytes4 constant ROOT_ACCESS = 0;

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

// DiamondStorage positions
bytes32 constant PERMISSION_STORAGE_POSITION = keccak256("PERMISSION_STORAGE");
bytes32 constant ASSET_STORAGE_POSITION = keccak256("ASSET_STORAGE");

struct AssetStorage {
    // AssetId => Asset
    mapping (bytes32 => Asset) assets;
}

struct PermissionStorage {
    // Actor => is approved
    mapping(address => bool) approvedActors;
}

function permissionStorage() pure returns(PermissionStorage storage ps) {
    bytes32 position = PERMISSION_STORAGE_POSITION;
    assembly {
        ps.slot := position
    }
}

function assetStorage() pure returns(AssetStorage storage _as) {
    bytes32 position = ASSET_STORAGE_POSITION;
    assembly {
        _as.slot := position
    }
}
