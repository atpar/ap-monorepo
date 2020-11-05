// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../Lib.sol";
import "./AccessControl/IAccessControlFacet.sol";


/**
 * @title BaseFacet
 * @notice Shared methods amongst all facets
 */
contract BaseFacet {
    modifier onlyApprovedActors {
        require(
            permissionStorage().approvedActors[msg.sender],
            "BaseFacet.setAsset: UNAUTHORIZED_SENDER"
        );
        _;
    }

    modifier isAuthorized(bytes32 assetId) {
        require(
            msg.sender == assetStorage().assets[assetId].actor
            || IAccessControlFacet(address(this)).hasAccess(assetId, msg.sig, msg.sender),
            "BaseFacet.isAuthorized: UNAUTHORIZED_SENDER"
        );
        _;
    }
}
