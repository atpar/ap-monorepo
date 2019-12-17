pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./IProductRegistry.sol";
import "./ProductRegistryStorage.sol";


/**
 * @title ProductRegistry
 * @notice Registry for ACTUS compatible products.
 * A Product is made up of a set of ProductTerms and ProductSchedules.
 */
contract ProductRegistry is ProductRegistryStorage, IProductRegistry {

    event RegisteredProduct(bytes32 productId);


    /**
     * @notice Returns the terms of a product.
     * @param productId id of the product
     * @return ProductTerms
     */
    function getProductTerms(bytes32 productId) external view returns (ProductTerms memory) {
        return (decodeAndGetTerms(productId));
    }

    /**
     * @notice Returns an event for a given position (index) in a schedule of a given product.
     * @param productId id of the product
     * @param scheduleId id of the schedule
     * @param index index of the event to return
     * @return Event
     */
    function getEventAtIndex(bytes32 productId, uint8 scheduleId, uint256 index) external view returns (bytes32) {
        return products[productId].productSchedules[scheduleId].productSchedule[index];
    }

    /**
     * @notice Returns the length of a schedule (given its scheduleId) of a given product.
     * @param productId id of the product
     * @param scheduleId id of the schedule
     * @return Length of the schedule
     */
    function getScheduleLength(bytes32 productId, uint8 scheduleId) external view returns (uint256) {
        return products[productId].productSchedules[scheduleId].length;
    }

    /**
     * @notice Convenience method for retrieving the entire schedule for a given scheduleId
     * Not recommended to execute it on-chain (if schedule is too long the tx may run out of gas)
     * @param productId id of the product
     * @param scheduleId id of the schedule to retrieve
     * @return the schedule
     */
    function getSchedule(bytes32 productId, uint8 scheduleId) external view returns (bytes32[] memory schedule) {
        uint256 scheduleLength = products[productId].productSchedules[scheduleId].length;
        schedule = new bytes32[](scheduleLength);

        for (uint256 i = 0; i < scheduleLength; i++) {
            schedule[i] = products[productId].productSchedules[scheduleId].productSchedule[i];
        }

        return schedule;
    }

    /**
     * @notice Stores a new product for given set of ProductTerms and ProductSchedules.
     * The productId is derived from the hash of the ProductTerms and the ProductSchedules
     * to circumvent duplicate ProductTerms on-chain.
     * @param terms set of ProductTerms
     * @param productSchedules set of ProductSchedules which encode offsets for ScheduleTime relative to an AnchorDate
     */
    function registerProduct(ProductTerms memory terms, ProductSchedules memory productSchedules) public {
        // derive the productId from the hash of the provided ProductTerms and ProductSchedules
        bytes32 productId = keccak256(
            abi.encode(
                keccak256(abi.encode(terms)),
                keccak256(abi.encode(productSchedules))
            )
        );

        // revert if a product for the derived product already exists
        require(
            products[productId].isSet == false,
            "ProductRegistry.registerProduct: ENTRY_ALREADY_EXISTS"
        );

        // store the product
        setProduct(productId, terms, productSchedules);

        emit RegisteredProduct(productId);
    }
}