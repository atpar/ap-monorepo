// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../Lib.sol";
import "../BaseFacet.sol";
import "./IAccessControlFacet.sol";


contract AccessControlFacet is BaseFacet, IAccessControlFacet {

    event GrantedAccess(bytes32 indexed assetId, address indexed account, bytes4 methodSignature);
    event RevokedAccess(bytes32 indexed assetId, address indexed account, bytes4 methodSignature);


    /**
     * @notice Grant access to an account to call a specific method on a specific asset.
     * @dev Can only be called by an authorized account.
     * @param assetId id of the asset
     * @param methodSignature function / method signature (4 byte keccak256 hash of the method selector)
     * @param account address of the account to grant access to
     */
    function grantAccess(bytes32 assetId, bytes4 methodSignature, address account)
        external
        override
    {
        require(
            hasAccess(assetId, msg.sig, msg.sender),
            "AccessControlFacet.revokeAccess: UNAUTHORIZED_SENDER"
        );

        assetStorage().assets[assetId].access[methodSignature][account] = true;

        emit GrantedAccess(assetId, account, methodSignature);
    }

    /**
     * @notice Revoke access for an account to call a specific method on a specific asset.
     * @dev Can only be called by an authorized account.
     * @param assetId id of the asset
     * @param methodSignature function / method signature (4 byte keccak256 hash of the method selector)
     * @param account address of the account to revoke access for
     */
    function revokeAccess(bytes32 assetId, bytes4 methodSignature, address account)
        external
        override
    {
        require(
            hasAccess(assetId, msg.sig, msg.sender),
            "AccessControlFacet.revokeAccess: UNAUTHORIZED_SENDER"
        );

        assetStorage().assets[assetId].access[methodSignature][account] = false;

        emit RevokedAccess(assetId, account, methodSignature);
    }

    /**
     * @notice Check whether an account is allowed to call a specific method on a specific asset.
     * @param assetId id of the asset
     * @param methodSignature function / method signature (4 byte keccak256 hash of the method selector)
     * @param account address of the account for which to check access
     * @return true if allowed access
     */
    function hasAccess(bytes32 assetId, bytes4 methodSignature, address account)
        public
        view
        override
        returns (bool)
    {
        return (
            assetStorage().assets[assetId].access[methodSignature][account]
            || assetStorage().assets[assetId].access[ROOT_ACCESS][account]
        );
    }

    /**
     * @notice Check whether an account has root access for a specific asset.
     * @param assetId id of the asset
     * @param account address of the account for which to check root acccess
     * @return  true if has root access
     */
    function hasRootAccess(bytes32 assetId, address account)
        public
        view
        override
        returns (bool)
    {
        return (assetStorage().assets[assetId].access[ROOT_ACCESS][account]);
    }

    // /**
    //  * @notice Grant access to an account to call all methods on a specific asset
    //  * (giving the account root access to an asset).
    //  * @param assetId id of the asset
    //  * @param account address of the account to set as the root
    //  */
    // function setDefaultRoot(bytes32 assetId, address account) internal {
    //     assetStorage().assets[assetId].access[ROOT_ACCESS][account] = true;
    //     emit GrantedAccess(assetId, account, ROOT_ACCESS);
    // }
}