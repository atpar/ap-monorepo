pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./IMarketObjectRegistry.sol";
import "./MarketObjectRegistryStorage.sol";


contract MarketObjectRegistry is MarketObjectRegistryStorage, IMarketObjectRegistry, Ownable {

  function setMarketObjectProvider(
    bytes32 marketObjectId,
    address provider
  )
    public
    onlyOwner
  {
    marketObjectProviders[marketObjectId] = provider;
  }

  function publishMarketObject(
    bytes32 marketObjectId,
    uint256 timestamp,
    int256 marketObject
  ) public {
    require(
      msg.sender == marketObjectProviders[marketObjectId],
      "MarketObjectRegistry.publishMarketObject: UNAUTHORIZED_SENDER"
    );

    marketObjects[marketObjectId][timestamp] = marketObject;
    marketObjectLastUpdatedAt[marketObjectId] = timestamp;
  }

  function getMarketObject(
    bytes32 marketObjectId,
    uint256 timestamp
  )
    public
    view
    returns (int256)
  {
    return marketObjects[marketObjectId][timestamp];
  }

  function getMarketObjectLastUpdatedTimestamp(
    bytes32 marketObjectId,
    uint256 timestamp
  )
    public
    view
    returns (uint256)
  {
    return marketObjectLastUpdatedAt[marketObjectId];
  }
}
