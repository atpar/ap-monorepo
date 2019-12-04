pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./ProductRegistryStorage.sol";


contract IProductRegistry is ProductRegistryStorage {

    function getProductTerms(bytes32 productId) external view returns (ProductTerms memory);

    function getEventAtIndex(bytes32 productId, uint8 scheduleId, uint256 index) external view returns (bytes32);

    function getScheduleLength(bytes32 productId, uint8 scheduleId) external view returns (uint256);

    function registerProduct(bytes32 productId, ProductTerms memory terms, ProductSchedules memory productSchedules) public;
}