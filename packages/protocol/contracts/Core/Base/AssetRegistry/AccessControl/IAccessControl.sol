// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;


interface IAccessControl {

    function grantAccess(bytes32 assetId, bytes4 methodSignature, address account)
        external;

    function revokeAccess(bytes32 assetId, bytes4 methodSignature, address account)
        external;

    function hasAccess(bytes32 assetId, bytes4 methodSignature, address account)
        external
        returns (bool);

    function hasRootAccess(bytes32 assetId, address account)
        external
        returns (bool);
}
