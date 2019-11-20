pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./ProductRegistryStorage.sol";


contract IProductRegistry is ProductRegistryStorage {

  function getProductTerms(bytes32 productId) external view returns (ProductTerms memory);

  function getNonCyclicEventAtIndex(bytes32 productId, uint256 index) external view returns (bytes32);

	function getCyclicEventAtIndex(bytes32 productId, EventType eventType, uint256 index) external view returns (bytes32);

	function getNonCyclicScheduleLength(bytes32 productId) external view returns (uint256);

	function getCyclicScheduleLength(bytes32 productId, EventType eventType) external view returns (uint256);

  function registerProduct(bytes32 productId, ProductTerms memory terms, Schedules memory protoSchedules) public;
}