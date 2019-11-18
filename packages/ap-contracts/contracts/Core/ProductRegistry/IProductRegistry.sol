pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./ProductRegistryStorage.sol";


contract IProductRegistry is ProductRegistryStorage {

  function getProductTerms(bytes32 productId) external view returns (LifecycleTerms memory);

  function getNonCyclicProtoEventAtIndex(bytes32 productId, uint256 index) external view returns (bytes32);

	function getCyclicProtoEventAtIndex(bytes32 productId, EventType eventType, uint256 index) external view returns (bytes32);

	function getNonCyclicProtoEventScheduleLength(bytes32 productId) external view returns (uint256);

	function getCyclicProtoEventScheduleLength(bytes32 productId, EventType eventType) external view returns (uint256);

  function registerProduct(bytes32 productId, LifecycleTerms memory terms, ProtoEventSchedules memory protoEventSchedules) public;
}