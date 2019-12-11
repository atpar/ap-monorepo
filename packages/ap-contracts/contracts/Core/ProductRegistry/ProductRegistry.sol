pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./IProductRegistry.sol";
import "./ProductRegistryStorage.sol";


/**
 *
 */
contract ProductRegistry is ProductRegistryStorage, IProductRegistry {

    event RegistedProduct(bytes32 productId);


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
     * the productId is derived from the hash of the ProductTerms and the ProductSchedules to circumvent duplicate ProductTerms on-chain
     * @param terms set of ProductTerms
     * @param productSchedules set of ProductSchedules encode offsets for ScheduleTime relative to an AnchorDate
     */
    function registerProduct(
        ProductTerms memory terms,
        ProductSchedules memory productSchedules
    )
        public
    {
        bytes32 productId = keccak256(
            abi.encode(
                keccak256(abi.encode(terms)),
                keccak256(abi.encode(productSchedules))
            )
        );

        require(
            products[productId].isSet == false,
            "ProductRegistry.registerProduct: ENTRY_ALREADY_EXISTS"
        );

        setProduct(productId, terms, productSchedules);

        emit RegistedProduct(productId);
    }
}