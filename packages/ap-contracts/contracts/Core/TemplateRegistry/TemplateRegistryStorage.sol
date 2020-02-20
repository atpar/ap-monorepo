pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../SharedTypes.sol";


/**
 * @title TemplateRegistryStorage
 * @notice Describes the storage of the TemplateRegistry.
 * Contains getter and setter methods for encoding, decoding data to optimize gas cost
 */
contract TemplateRegistryStorage is SharedTypes {

    struct Template {
        mapping (uint256 => bytes32) packedTerms;
        mapping (uint8 => TemplateSchedule) templateSchedules;
        bool isSet;
    }

    mapping (bytes32 => Template) templates;


    function setTemplate(
        bytes32 templateId,
        TemplateTerms memory terms,
        TemplateSchedules memory templateSchedules
    )
        internal
    {
        templates[templateId] = Template({ isSet: true });

        encodeAndSetTerms(templateId, terms);
        encodeAndSetSchedules(templateId, templateSchedules);
    }

    function encodeAndSetTerms(bytes32 templateId, TemplateTerms memory terms) internal {
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

        if (enums != bytes32(0)) templates[templateId].packedTerms[1] = enums;

        if (terms.currency != address(0)) templates[templateId].packedTerms[4] = bytes32(uint256(terms.currency) << 96);
        if (terms.settlementCurrency != address(0)) templates[templateId].packedTerms[5] = bytes32(uint256(terms.settlementCurrency) << 96);

        if (terms.marketObjectCodeRateReset != bytes32(0)) templates[templateId].packedTerms[6] = bytes32(terms.marketObjectCodeRateReset);

        if (terms.statusDateOffset != uint256(0)) templates[templateId].packedTerms[7] = bytes32(terms.statusDateOffset);
        if (terms.maturityDateOffset != uint256(0)) templates[templateId].packedTerms[8] = bytes32(terms.maturityDateOffset);

        if (terms.notionalPrincipal != int256(0)) templates[templateId].packedTerms[17] = bytes32(terms.notionalPrincipal);
        if (terms.nominalInterestRate != int256(0)) templates[templateId].packedTerms[18] = bytes32(terms.nominalInterestRate);
        if (terms.feeAccrued != int256(0)) templates[templateId].packedTerms[19] = bytes32(terms.feeAccrued);
        if (terms.accruedInterest != int256(0)) templates[templateId].packedTerms[20] = bytes32(terms.accruedInterest);
        if (terms.rateMultiplier != int256(0)) templates[templateId].packedTerms[21] = bytes32(terms.rateMultiplier);
        if (terms.rateSpread != int256(0)) templates[templateId].packedTerms[22] = bytes32(terms.rateSpread);
        if (terms.feeRate != int256(0)) templates[templateId].packedTerms[23] = bytes32(terms.feeRate);
        if (terms.nextResetRate != int256(0)) templates[templateId].packedTerms[24] = bytes32(terms.nextResetRate);
        if (terms.penaltyRate != int256(0)) templates[templateId].packedTerms[25] = bytes32(terms.penaltyRate);
        if (terms.premiumDiscountAtIED != int256(0)) templates[templateId].packedTerms[26] = bytes32(terms.premiumDiscountAtIED);
        if (terms.priceAtPurchaseDate != int256(0)) templates[templateId].packedTerms[27] = bytes32(terms.priceAtPurchaseDate);
        // solium-disable-next-line
        if (terms.nextPrincipalRedemptionPayment != int256(0)) templates[templateId].packedTerms[28] = bytes32(terms.nextPrincipalRedemptionPayment);
        // solium-disable-next-line
        if (terms.coverageOfCreditEnhancement != int256(0)) templates[templateId].packedTerms[29] = bytes32(terms.coverageOfCreditEnhancement);
        if (terms.lifeCap != int256(0)) templates[templateId].packedTerms[30] = bytes32(terms.lifeCap);
        if (terms.lifeFloor != int256(0)) templates[templateId].packedTerms[31] = bytes32(terms.lifeFloor);
        if (terms.periodCap != int256(0)) templates[templateId].packedTerms[32] = bytes32(terms.periodCap);
        if (terms.periodFloor != int256(0)) templates[templateId].packedTerms[33] = bytes32(terms.periodFloor);

        if (terms.gracePeriod.isSet) {
            templates[templateId].packedTerms[34] =
                bytes32(uint256(terms.gracePeriod.i)) << 24 |
                bytes32(uint256(terms.gracePeriod.p)) << 16 |
                bytes32(uint256(1)) << 8;
        }
        if (terms.delinquencyPeriod.isSet) {
            templates[templateId].packedTerms[35] =
                bytes32(uint256(terms.delinquencyPeriod.i)) << 24 |
                bytes32(uint256(terms.delinquencyPeriod.p)) << 16 |
                bytes32(uint256(1)) << 8;
        }
    }

    function encodeAndSetSchedules(bytes32 templateId, TemplateSchedules memory templateSchedules)
        internal
    {
        for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
            if (templateSchedules.nonCyclicSchedule[i] == bytes32(0)) break;
            templates[templateId].templateSchedules[NON_CYCLIC_INDEX].templateSchedule[i] = templateSchedules.nonCyclicSchedule[i];
            templates[templateId].templateSchedules[NON_CYCLIC_INDEX].length = i + 1;
        }

        uint8 indexIP = uint8(EventType.IP);
        for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
            if (templateSchedules.cyclicIPSchedule[i] == bytes32(0)) break;
            templates[templateId].templateSchedules[indexIP].templateSchedule[i] = templateSchedules.cyclicIPSchedule[i];
            templates[templateId].templateSchedules[indexIP].length = i + 1;
        }

        uint8 indexPR = uint8(EventType.PR);
        for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
            if (templateSchedules.cyclicPRSchedule[i] == bytes32(0)) break;
            templates[templateId].templateSchedules[indexPR].templateSchedule[i] = templateSchedules.cyclicPRSchedule[i];
            templates[templateId].templateSchedules[indexPR].length = i + 1;
        }

        uint8 indexRR = uint8(EventType.RR);
        for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
            if (templateSchedules.cyclicRRSchedule[i] == bytes32(0)) break;
            templates[templateId].templateSchedules[indexRR].templateSchedule[i] = templateSchedules.cyclicRRSchedule[i];
            templates[templateId].templateSchedules[indexRR].length = i + 1;
        }

        uint8 indexPY = uint8(EventType.PY);
        for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
            if (templateSchedules.cyclicPYSchedule[i] == bytes32(0)) break;
            templates[templateId].templateSchedules[indexPY].templateSchedule[i] = templateSchedules.cyclicPYSchedule[i];
            templates[templateId].templateSchedules[indexPY].length = i + 1;
        }

        uint8 indexSC = uint8(EventType.SC);
        for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
            if (templateSchedules.cyclicSCSchedule[i] == bytes32(0)) break;
            templates[templateId].templateSchedules[indexSC].templateSchedule[i] = templateSchedules.cyclicSCSchedule[i];
            templates[templateId].templateSchedules[indexSC].length = i + 1;
        }

        uint8 indexFP = uint8(EventType.FP);
        for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
            if (templateSchedules.cyclicFPSchedule[i] == bytes32(0)) break;
            templates[templateId].templateSchedules[indexFP].templateSchedule[i] = templateSchedules.cyclicFPSchedule[i];
            templates[templateId].templateSchedules[indexFP].length = i + 1;
        }
    }

    function decodeAndGetTerms(bytes32 templateId) internal view returns (TemplateTerms memory) {
        return TemplateTerms(
            Calendar(uint8(uint256(templates[templateId].packedTerms[1] >> 240))),
            ContractRole(uint8(uint256(templates[templateId].packedTerms[1] >> 232))),
            DayCountConvention(uint8(uint256(templates[templateId].packedTerms[1] >> 224))),
            BusinessDayConvention(uint8(uint256(templates[templateId].packedTerms[1] >> 216))),
            EndOfMonthConvention(uint8(uint256(templates[templateId].packedTerms[1] >> 208))),
            ScalingEffect(uint8(uint256(templates[templateId].packedTerms[1] >> 200))),
            PenaltyType(uint8(uint256(templates[templateId].packedTerms[1] >> 192))),
            FeeBasis(uint8(uint256(templates[templateId].packedTerms[1] >> 184))),
            ContractPerformance(uint8(uint256(templates[templateId].packedTerms[1] >> 176))),

            address(uint160(uint256(templates[templateId].packedTerms[4]) >> 96)),
            address(uint160(uint256(templates[templateId].packedTerms[5]) >> 96)),

            templates[templateId].packedTerms[6],

            uint256(templates[templateId].packedTerms[7]),
            uint256(templates[templateId].packedTerms[8]),
            int256(templates[templateId].packedTerms[17]),
            int256(templates[templateId].packedTerms[18]),
            int256(templates[templateId].packedTerms[19]),
            int256(templates[templateId].packedTerms[20]),
            int256(templates[templateId].packedTerms[21]),
            int256(templates[templateId].packedTerms[22]),
            int256(templates[templateId].packedTerms[23]),
            int256(templates[templateId].packedTerms[24]),
            int256(templates[templateId].packedTerms[25]),
            int256(templates[templateId].packedTerms[26]),
            int256(templates[templateId].packedTerms[27]),
            int256(templates[templateId].packedTerms[28]),
            int256(templates[templateId].packedTerms[29]),
            int256(templates[templateId].packedTerms[30]),
            int256(templates[templateId].packedTerms[31]),
            int256(templates[templateId].packedTerms[32]),
            int256(templates[templateId].packedTerms[33]),

            IP(
                uint256(templates[templateId].packedTerms[34] >> 24),
                P(uint8(uint256(templates[templateId].packedTerms[34] >> 16))),
                (templates[templateId].packedTerms[34] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),
            IP(
                uint256(templates[templateId].packedTerms[35] >> 24),
                P(uint8(uint256(templates[templateId].packedTerms[35] >> 16))),
                (templates[templateId].packedTerms[35] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            )
        );
    }
}
