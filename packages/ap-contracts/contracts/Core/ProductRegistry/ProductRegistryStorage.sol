pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../SharedTypes.sol";


/**
 * @title ProductRegistryStorage
 * @notice Describes the storage of the ProductRegistry.
 * Contains getter and setter methods for encoding, decoding data to optimize gas cost
 */
contract ProductRegistryStorage is SharedTypes {

    struct Product {
        mapping (uint256 => bytes32) packedTerms;
        mapping (uint8 => ProductSchedule) productSchedules;
        bool isSet;
    }

    mapping (bytes32 => Product) products;


    function setProduct(
        bytes32 productId,
        ProductTerms memory terms,
        ProductSchedules memory productSchedules
    )
        internal
    {
        products[productId] = Product({ isSet: true });

        encodeAndSetTerms(productId, terms);
        encodeAndSetSchedules(productId, productSchedules);
    }

    function encodeAndSetTerms(bytes32 productId, ProductTerms memory terms) internal {
        bytes32 enums =
            bytes32(uint256(uint8(terms.calendar))) << 240 |
            bytes32(uint256(uint8(terms.contractRole))) << 232 |
            bytes32(uint256(uint8(terms.dayCountConvention))) << 224 |
            bytes32(uint256(uint8(terms.businessDayConvention))) << 216 |
            bytes32(uint256(uint8(terms.endOfMonthConvention))) << 208 |
            bytes32(uint256(uint8(terms.scalingEffect))) << 200 |
            bytes32(uint256(uint8(terms.penaltyType))) << 192 |
            bytes32(uint256(uint8(terms.feeBasis))) << 184 |
            bytes32(uint256(uint8(terms.creditEventTypeCovered))) << 176;

        if (enums != bytes32(0)) products[productId].packedTerms[1] = enums;

        if (terms.currency != address(0)) products[productId].packedTerms[4] = bytes32(uint256(terms.currency) << 96);
        if (terms.settlementCurrency != address(0)) products[productId].packedTerms[5] = bytes32(uint256(terms.settlementCurrency) << 96);

        if (terms.marketObjectCodeRateReset != bytes32(0)) products[productId].packedTerms[6] = bytes32(terms.marketObjectCodeRateReset);

        if (terms.statusDateOffset != uint256(0)) products[productId].packedTerms[7] = bytes32(terms.statusDateOffset);
        if (terms.maturityDateOffset != uint256(0)) products[productId].packedTerms[8] = bytes32(terms.maturityDateOffset);

        if (terms.feeAccrued != int256(0)) products[productId].packedTerms[19] = bytes32(terms.feeAccrued);
        if (terms.accruedInterest != int256(0)) products[productId].packedTerms[20] = bytes32(terms.accruedInterest);
        if (terms.rateMultiplier != int256(0)) products[productId].packedTerms[21] = bytes32(terms.rateMultiplier);
        if (terms.feeRate != int256(0)) products[productId].packedTerms[23] = bytes32(terms.feeRate);
        if (terms.nextResetRate != int256(0)) products[productId].packedTerms[24] = bytes32(terms.nextResetRate);
        if (terms.penaltyRate != int256(0)) products[productId].packedTerms[25] = bytes32(terms.penaltyRate);
        if (terms.priceAtPurchaseDate != int256(0)) products[productId].packedTerms[27] = bytes32(terms.priceAtPurchaseDate);
        // solium-disable-next-line
        if (terms.nextPrincipalRedemptionPayment != int256(0)) products[productId].packedTerms[28] = bytes32(terms.nextPrincipalRedemptionPayment);

        if (terms.gracePeriod.isSet) {
            products[productId].packedTerms[34] =
                bytes32(uint256(terms.gracePeriod.i)) << 24 |
                bytes32(uint256(terms.gracePeriod.p)) << 16 |
                bytes32(uint256(1)) << 8;
        }
        if (terms.delinquencyPeriod.isSet) {
            products[productId].packedTerms[35] =
                bytes32(uint256(terms.delinquencyPeriod.i)) << 24 |
                bytes32(uint256(terms.delinquencyPeriod.p)) << 16 |
                bytes32(uint256(1)) << 8;
        }

        if (terms.periodCap != int256(0)) products[productId].packedTerms[38] = bytes32(terms.periodCap);
        if (terms.periodFloor != int256(0)) products[productId].packedTerms[39] = bytes32(terms.periodFloor);
    }

    function encodeAndSetSchedules(bytes32 productId, ProductSchedules memory productSchedules)
        internal
    {
        for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
            if (productSchedules.nonCyclicSchedule[i] == bytes32(0)) break;
            products[productId].productSchedules[NON_CYCLIC_INDEX].productSchedule[i] = productSchedules.nonCyclicSchedule[i];
            products[productId].productSchedules[NON_CYCLIC_INDEX].length = i;
        }

        uint8 indexIP = uint8(EventType.IP);
        for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
            if (productSchedules.cyclicIPSchedule[i] == bytes32(0)) break;
            products[productId].productSchedules[indexIP].productSchedule[i] = productSchedules.cyclicIPSchedule[i];
            products[productId].productSchedules[indexIP].length = i;
        }

        uint8 indexPR = uint8(EventType.PR);
        for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
            if (productSchedules.cyclicPRSchedule[i] == bytes32(0)) break;
            products[productId].productSchedules[indexPR].productSchedule[i] = productSchedules.cyclicPRSchedule[i];
            products[productId].productSchedules[indexPR].length = i;
        }

        uint8 indexRR = uint8(EventType.RR);
        for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
            if (productSchedules.cyclicRRSchedule[i] == bytes32(0)) break;
            products[productId].productSchedules[indexRR].productSchedule[i] = productSchedules.cyclicRRSchedule[i];
            products[productId].productSchedules[indexRR].length = i;
        }

        uint8 indexPY = uint8(EventType.PY);
        for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
            if (productSchedules.cyclicPYSchedule[i] == bytes32(0)) break;
            products[productId].productSchedules[indexPY].productSchedule[i] = productSchedules.cyclicPYSchedule[i];
            products[productId].productSchedules[indexPY].length = i;
        }

        uint8 indexSC = uint8(EventType.SC);
        for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
            if (productSchedules.cyclicSCSchedule[i] == bytes32(0)) break;
            products[productId].productSchedules[indexSC].productSchedule[i] = productSchedules.cyclicSCSchedule[i];
            products[productId].productSchedules[indexSC].length = i;
        }

        uint8 indexFP = uint8(EventType.FP);
        for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
            if (productSchedules.cyclicFPSchedule[i] == bytes32(0)) break;
            products[productId].productSchedules[indexFP].productSchedule[i] = productSchedules.cyclicFPSchedule[i];
            products[productId].productSchedules[indexFP].length = i;
        }
    }

    function decodeAndGetTerms(bytes32 productId) internal view returns (ProductTerms memory) {
        return ProductTerms(
            Calendar(uint8(uint256(products[productId].packedTerms[1] >> 240))),
            ContractRole(uint8(uint256(products[productId].packedTerms[1] >> 232))),
            DayCountConvention(uint8(uint256(products[productId].packedTerms[1] >> 224))),
            BusinessDayConvention(uint8(uint256(products[productId].packedTerms[1] >> 216))),
            EndOfMonthConvention(uint8(uint256(products[productId].packedTerms[1] >> 208))),
            ScalingEffect(uint8(uint256(products[productId].packedTerms[1] >> 200))),
            PenaltyType(uint8(uint256(products[productId].packedTerms[1] >> 192))),
            FeeBasis(uint8(uint256(products[productId].packedTerms[1] >> 184))),
            ContractPerformance(uint8(uint256(products[productId].packedTerms[1] >> 176))),

            address(uint160(uint256(products[productId].packedTerms[4]) >> 96)),
            address(uint160(uint256(products[productId].packedTerms[5]) >> 96)),

            products[productId].packedTerms[6],

            uint256(products[productId].packedTerms[7]),
            uint256(products[productId].packedTerms[8]),
            int256(products[productId].packedTerms[19]),
            int256(products[productId].packedTerms[20]),
            int256(products[productId].packedTerms[21]),
            int256(products[productId].packedTerms[23]),
            int256(products[productId].packedTerms[24]),
            int256(products[productId].packedTerms[25]),
            int256(products[productId].packedTerms[27]),
            int256(products[productId].packedTerms[28]),

            IP(
                uint256(products[productId].packedTerms[34] >> 24),
                P(uint8(uint256(products[productId].packedTerms[34] >> 16))),
                (products[productId].packedTerms[34] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),
            IP(
                uint256(products[productId].packedTerms[35] >> 24),
                P(uint8(uint256(products[productId].packedTerms[35] >> 16))),
                (products[productId].packedTerms[35] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),

            int256(products[productId].packedTerms[38]),
            int256(products[productId].packedTerms[39])
        );
    }
}
