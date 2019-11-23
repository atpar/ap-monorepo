pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../SharedTypes.sol";


contract MarketObjectRegistryStorage is SharedTypes {

  struct DataPoint {
    int256 dataPoint;
    bool isSet;
  }

  mapping(bytes32 => mapping(uint256 => DataPoint)) dataPoints;

  mapping(bytes32 => uint256) marketObjectLastUpdatedAt;

  mapping(bytes32 => address) marketObjectProviders;
}