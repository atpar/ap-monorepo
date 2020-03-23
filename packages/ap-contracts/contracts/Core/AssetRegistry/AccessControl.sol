pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./AssetRegistryStorage.sol";


contract AccessControl is AssetRegistryStorage {

  event SetRootAccess(bytes32 indexed assetId, address indexed account);
  event GrantedAccess(bytes32 indexed assetId, address indexed account, bytes4 methodSignature);
  event RevokedAccess(bytes32 indexed assetId, address indexed account, bytes4 methodSignature);


  // Method signature == bytes4(0) := Access to all methods defined in the Asset Registry contract
  bytes4 constant ROOT_ACCESS = bytes4(0);


  /**
   * @notice Check whether an account is allowed to call a specific method on a specific asset.
   * @param assetId id of the asset
   * @param methodSignature function / method signature (4 byte keccak256 hash of the method selector)
   * @param account address of the account to check the access
   * @return true if allowed access
   */
  function checkAccess (bytes32 assetId, bytes4 methodSignature, address account) public returns (bool) {
    return (assets[assetId].access[methodSignature][account] == true);
  }

  /**
   * @notice Grant access to an account to call a specific method on a specific asset.
   * @dev Can only be called by an authorized account.
   * @param assetId id of the asset
   * @param methodSignature function / method signature (4 byte keccak256 hash of the method selector)
   * @param account address of the account to grant access to
   */
  function grantAccess (bytes32 assetId, bytes4 methodSignature, address account) public {
    require(
      checkAccess(assetId, msg.sig, msg.sender),
      "AssetRegistry.revokeAccess: UNAUTHORIZED_SENDER"
    );

    assets[assetId].access[methodSignature][account] = true;

    emit GrantedAccess(assetId, account, methodSignature);
  }

  /**
   * @notice Revoke access for an account to call a specific method on a specific asset.
   * @dev Can only be called by an authorized account.
   * @param assetId id of the asset
   * @param methodSignature function / method signature (4 byte keccak256 hash of the method selector)
   * @param account address of the account to revoke access for
   */
  function revokeAccess (bytes32 assetId, bytes4 methodSignature, address account) public {
    require(
      checkAccess(assetId, msg.sig, msg.sender),
      "AssetRegistry.revokeAccess: UNAUTHORIZED_SENDER"
    );

    assets[assetId].access[methodSignature][account] = false;

    emit RevokedAccess(assetId, account, methodSignature);
  }

  /**
   * @notice Grant access to an account to call all methods on a specific asset
   * (giving the account root access to an asset).
   * @param assetId id of the asset
   * @param account address of the account to set as the root
   */
  function setDefaultRoot (bytes32 assetId, address account) internal {
    assets[assetId].access[ROOT_ACCESS][account] = true;

    emit SetRootAccess(assetId, account);
  }
}
