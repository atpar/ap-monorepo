pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./IProductRegistry.sol";
import "./ProductRegistryStorage.sol";


/**
 *
 */
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
	 * returns an event for a given position (index) of a schedule of a given product
	 * @param productId id of the product
	 * @param scheduleId id of the schedule
	 * @param index index of the event to return
	 * @return Event
	 */
	function getEventAtIndex(bytes32 productId, uint8 scheduleId, uint256 index) external view returns (bytes32) {
		return products[productId].productSchedules[scheduleId].productSchedule[index];
	}

	/**
	 * returns the length of the a schedule of a given product
	 * @param productId id of the product
	 * @param scheduleId id of the schedule
	 * @return Length of the schedule
	 */
	function getScheduleLength(bytes32 productId, uint8 scheduleId) external view returns (uint256) {
		return products[productId].productSchedules[scheduleId].length;
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