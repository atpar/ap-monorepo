pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./SharedTypes.sol";


contract ICustodian is SharedTypes {

  function lockCollateral(
    bytes32 collateralId,
    LifecycleTerms memory terms,
    AssetOwnership memory ownership
  )
    public
    returns (bool);

  function returnCollateral(
    bytes32 assetId
  )
    public
    returns (bool);
}