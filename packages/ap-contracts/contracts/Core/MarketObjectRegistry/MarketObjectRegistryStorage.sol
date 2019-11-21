pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "actus-solidity/contracts/Core/Definitions.sol";

import "../SharedTypes.sol";


contract MarketObjectRegistryStorage is Definitions, SharedTypes {

  mapping(bytes32 => mapping(uint256 => int256)) marketObjects;

  mapping(bytes32 => uint256) marketObjectLastUpdatedAt;

  mapping(bytes32 => address) marketObjectProviders;
}