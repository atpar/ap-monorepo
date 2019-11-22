pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./IProductRegistry.sol";
import "./ProductRegistryStorage.sol";


contract ProductRegistry is ProductRegistryStorage, IProductRegistry {

	/**
	 * returns the terms of a product
	 * @param productId id of the product
	 * @return ProductTerms
	 */
	function getProductTerms(
		bytes32 productId
	)
		external
		view
		returns (ProductTerms memory)
	{
		return (decodeAndGetTerms(productId));
	}

	/**
	 * returns an event for a given position (index) of a non-cyclic schedule of a given product
	 * @param productId id of the product
	 * @param index index of the event to return
	 * @return Event
	 */
	function getNonCyclicEventAtIndex(bytes32 productId, uint256 index) external view returns (bytes32) {
		return products[productId].productSchedules[NON_CYCLIC_INDEX].productSchedule[index];
	}

	/**
	 * returns an event for a given position (index) of a cyclic schedule of a given product
	 * @param productId id of the product
	 * @param eventType the cycles event type
	 * @param index index of the event to return
	 * @return Event
	 */
	function getCyclicEventAtIndex(bytes32 productId, EventType eventType, uint256 index) external view returns (bytes32) {
		return products[productId].productSchedules[uint8(eventType)].productSchedule[index];
	}

	/**
	 * returns the length of the a non-cyclic schedule of a given product
	 * @param productId id of the product
	 * @return Length of the schedule
	 */
	function getNonCyclicScheduleLength(bytes32 productId) external view returns (uint256) {
		return products[productId].productSchedules[NON_CYCLIC_INDEX].length;
	}

	/**
	 * returns the length of the a non-cyclic schedule of a given product
	 * @param productId id of the product
	 * @param eventType event type of the schedule
	 * @return Length of the schedule
	 */
	function getCyclicScheduleLength(bytes32 productId, EventType eventType) external view returns (uint256) {
		return products[productId].productSchedules[uint8(eventType)].length;
	}

	/**
	 * stores a new financial Product which is comprised of a set of ProductTerms and ProductSchedules
	 * @param productId id of the product (has to be unique otherwise it will revert)
	 * @param terms set of ProductTerms
	 * @param productSchedules set of ProductSchedules encode offsets for ScheduleTime relative to an AnchorDate
	 */
	function registerProduct(
		bytes32 productId,
		ProductTerms memory terms,
		ProductSchedules memory productSchedules
	)
		public
	{
		require(
			products[productId].isSet == false,
			"ProductRegistry.registerProduct: ENTRY_ALREADY_EXISTS"
		);

		setProduct(productId, terms, productSchedules);
	}
}