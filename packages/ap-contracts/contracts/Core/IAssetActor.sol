pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./SharedTypes.sol";


contract IAssetActor is SharedTypes {

  event AssetProgressed(bytes32 indexed assetId, EventType eventType, uint256 scheduleTime);


  function progress(bytes32 assetId) external;

  function initialize(
    bytes32 assetId,
    AssetOwnership memory ownership,
    bytes32 productId,
    CustomTerms memory customTerms,
    address engine
  )
    public
    returns (bool);
}
