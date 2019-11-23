pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../SharedTypes.sol";


contract MarketObjectRegistryStorage is SharedTypes {

  mapping(bytes32 => mapping(uint256 => int256)) dataPoints;

  mapping(bytes32 => uint256) marketObjectLastUpdatedAt;

  mapping(bytes32 => address) marketObjectProviders;
}