pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./MarketObjectRegistryStorage.sol";


contract IMarketObjectRegistry is MarketObjectRegistryStorage {

  function publishMarketObject(
    bytes32 marketObjectId,
    uint256 timestamp,
    int256 marketObject
  )
    public;

  function getMarketObject(
    bytes32 marketObjectId,
    uint256 timestamp
  )
    public
    view
    returns (int256);

  function getMarketObjectLastUpdatedTimestamp(
    bytes32 marketObjectId,
    uint256 timestamp
  )
    public
    view
    returns (uint256);
}