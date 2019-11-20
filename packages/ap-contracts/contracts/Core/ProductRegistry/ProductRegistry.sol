pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./IProductRegistry.sol";
import "./ProductRegistryStorage.sol";


contract ProductRegistry is ProductRegistryStorage, IProductRegistry {

  function getProductTerms(
    bytes32 productId
  )
    external
    view
    returns (ProductTerms memory)
  {
    return (decodeAndGetTerms(productId));
  }

  function getNonCyclicEventAtIndex(bytes32 productId, uint256 index) external view returns (bytes32) {
		return products[productId].protoSchedules[NON_CYCLIC_INDEX].protoSchedule[index];
	}

	function getCyclicEventAtIndex(bytes32 productId, EventType eventType, uint256 index) external view returns (bytes32) {
		return products[productId].protoSchedules[uint8(eventType)].protoSchedule[index];
	}

	function getNonCyclicScheduleLength(bytes32 productId) external view returns (uint256) {
		return products[productId].protoSchedules[NON_CYCLIC_INDEX].numberOfEvents;
	}

	function getCyclicScheduleLength(bytes32 productId, EventType eventType) external view returns (uint256) {
		return products[productId].protoSchedules[uint8(eventType)].numberOfEvents;
	}

  function registerProduct(
    bytes32 productId,
    ProductTerms memory terms,
    Schedules memory protoSchedules
  )
    public
  {
    require(
			products[productId].isSet == false,
			"ProductRegistry.registerProduct: ENTRY_ALREADY_EXISTS"
		);

    setProduct(productId, terms, protoSchedules);
  }
}