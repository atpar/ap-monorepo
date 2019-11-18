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
    returns (LifecycleTerms memory)
  {
    return (decodeAndGetTerms(productId));
  }

  function getNonCyclicProtoEventAtIndex(bytes32 productId, uint256 index) external view returns (bytes32) {
		return products[productId].protoEventSchedules[NON_CYCLIC_INDEX].protoEventSchedule[index];
	}

	function getCyclicProtoEventAtIndex(bytes32 productId, EventType eventType, uint256 index) external view returns (bytes32) {
		return products[productId].protoEventSchedules[uint8(eventType)].protoEventSchedule[index];
	}

	function getNonCyclicProtoEventScheduleLength(bytes32 productId) external view returns (uint256) {
		return products[productId].protoEventSchedules[NON_CYCLIC_INDEX].numberOfProtoEvents;
	}

	function getCyclicProtoEventScheduleLength(bytes32 productId, EventType eventType) external view returns (uint256) {
		return products[productId].protoEventSchedules[uint8(eventType)].numberOfProtoEvents;
	}

  function registerProduct(
    bytes32 productId,
    LifecycleTerms memory terms,
    ProtoEventSchedules memory protoEventSchedules
  )
    public
  {
    require(
			products[productId].isSet == false,
			"ProductRegistry.registerProduct: ENTRY_ALREADY_EXISTS"
		);

    setProduct(productId, terms, protoEventSchedules);
  }
}