pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../SharedTypes.sol";


/**
 * @title TemplateRegistryStorage
 * @notice Describes the storage of the TemplateRegistry.
 * Contains getter and setter methods for encoding, decoding data to optimize gas cost
 * Circumvents storing default values by relying on the characteristic of mappings returning zero for not set values.
 */
contract TemplateRegistryStorage is SharedTypes {

    struct Template {
        // boolean indicating that template exists
        bool isSet;
        // the schedule of the template
        TemplateSchedule templateSchedule;
        // tightly packed, encoded TemplateTerms
        // bytes32(0) used as default value for each attribute
        // storage id => bytes32 encoded value
        mapping (uint256 => bytes32) packedTerms;
    }

    mapping (bytes32 => Template) templates;


    function setTemplate(
        bytes32 templateId,
        TemplateTerms memory terms,
        bytes32[] memory templateSchedule
    )
        internal
    {
        templates[templateId] = Template({
            isSet: true,
            templateSchedule: TemplateSchedule({ length: 0 })
        });

        encodeAndSetTerms(templateId, terms);
        encodeAndSetSchedule(templateId, templateSchedule);
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

        if (terms.currency != address(0)) templates[templateId].packedTerms[2] = bytes32(uint256(terms.currency) << 96);
        if (terms.settlementCurrency != address(0)) templates[templateId].packedTerms[3] = bytes32(uint256(terms.settlementCurrency) << 96);

        if (terms.marketObjectCodeRateReset != bytes32(0)) templates[templateId].packedTerms[4] = bytes32(terms.marketObjectCodeRateReset);

        if (terms.statusDateOffset != uint256(0)) templates[templateId].packedTerms[5] = bytes32(terms.statusDateOffset);
        if (terms.maturityDateOffset != uint256(0)) templates[templateId].packedTerms[6] = bytes32(terms.maturityDateOffset);

        if (terms.notionalPrincipal != int256(0)) templates[templateId].packedTerms[7] = bytes32(terms.notionalPrincipal);
        if (terms.nominalInterestRate != int256(0)) templates[templateId].packedTerms[8] = bytes32(terms.nominalInterestRate);
        if (terms.feeAccrued != int256(0)) templates[templateId].packedTerms[9] = bytes32(terms.feeAccrued);
        if (terms.accruedInterest != int256(0)) templates[templateId].packedTerms[10] = bytes32(terms.accruedInterest);
        if (terms.rateMultiplier != int256(0)) templates[templateId].packedTerms[11] = bytes32(terms.rateMultiplier);
        if (terms.rateSpread != int256(0)) templates[templateId].packedTerms[12] = bytes32(terms.rateSpread);
        if (terms.feeRate != int256(0)) templates[templateId].packedTerms[13] = bytes32(terms.feeRate);
        if (terms.nextResetRate != int256(0)) templates[templateId].packedTerms[14] = bytes32(terms.nextResetRate);
        if (terms.penaltyRate != int256(0)) templates[templateId].packedTerms[15] = bytes32(terms.penaltyRate);
        if (terms.premiumDiscountAtIED != int256(0)) templates[templateId].packedTerms[16] = bytes32(terms.premiumDiscountAtIED);
        if (terms.priceAtPurchaseDate != int256(0)) templates[templateId].packedTerms[17] = bytes32(terms.priceAtPurchaseDate);
        // solium-disable-next-line
        if (terms.nextPrincipalRedemptionPayment != int256(0)) templates[templateId].packedTerms[18] = bytes32(terms.nextPrincipalRedemptionPayment);
        // solium-disable-next-line
        if (terms.coverageOfCreditEnhancement != int256(0)) templates[templateId].packedTerms[19] = bytes32(terms.coverageOfCreditEnhancement);
        if (terms.lifeCap != int256(0)) templates[templateId].packedTerms[20] = bytes32(terms.lifeCap);
        if (terms.lifeFloor != int256(0)) templates[templateId].packedTerms[21] = bytes32(terms.lifeFloor);
        if (terms.periodCap != int256(0)) templates[templateId].packedTerms[22] = bytes32(terms.periodCap);
        if (terms.periodFloor != int256(0)) templates[templateId].packedTerms[23] = bytes32(terms.periodFloor);

        if (terms.gracePeriod.isSet) {
            templates[templateId].packedTerms[24] =
                bytes32(uint256(terms.gracePeriod.i)) << 24 |
                bytes32(uint256(terms.gracePeriod.p)) << 16 |
                bytes32(uint256(1)) << 8;
        }
        if (terms.delinquencyPeriod.isSet) {
            templates[templateId].packedTerms[25] =
                bytes32(uint256(terms.delinquencyPeriod.i)) << 24 |
                bytes32(uint256(terms.delinquencyPeriod.p)) << 16 |
                bytes32(uint256(1)) << 8;
        }
    }

    function encodeAndSetSchedule(bytes32 templateId, bytes32[] memory templateSchedule)
        internal
    {
        require(
            templateSchedule.length != 0,
            "TemplateRegistry.encodeAndSetSchedule: EMPTY_SCHEDULE"
        );
        require(
            templateSchedule.length < MAX_EVENT_SCHEDULE_SIZE,
            "TemplateRegistry.encodeAndSetSchedule: MAX_EVENT_SCHEDULE_SIZE"
        );

        for (uint256 i = 0; i < templateSchedule.length; i++) {
            if (templateSchedule[i] == bytes32(0)) break;
            templates[templateId].templateSchedule.events[i] = templateSchedule[i];
            templates[templateId].templateSchedule.length = i + 1;
        }
    }

    function decodeAndGetTerms(bytes32 templateId)
        internal
        view
        returns (TemplateTerms memory)
    {
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

            address(uint160(uint256(templates[templateId].packedTerms[2]) >> 96)),
            address(uint160(uint256(templates[templateId].packedTerms[3]) >> 96)),

            templates[templateId].packedTerms[4],

            uint256(templates[templateId].packedTerms[5]),
            uint256(templates[templateId].packedTerms[6]),
            int256(templates[templateId].packedTerms[7]),
            int256(templates[templateId].packedTerms[8]),
            int256(templates[templateId].packedTerms[9]),
            int256(templates[templateId].packedTerms[10]),
            int256(templates[templateId].packedTerms[11]),
            int256(templates[templateId].packedTerms[12]),
            int256(templates[templateId].packedTerms[13]),
            int256(templates[templateId].packedTerms[14]),
            int256(templates[templateId].packedTerms[15]),
            int256(templates[templateId].packedTerms[16]),
            int256(templates[templateId].packedTerms[17]),
            int256(templates[templateId].packedTerms[18]),
            int256(templates[templateId].packedTerms[19]),
            int256(templates[templateId].packedTerms[20]),
            int256(templates[templateId].packedTerms[21]),
            int256(templates[templateId].packedTerms[22]),
            int256(templates[templateId].packedTerms[23]),

            IP(
                uint256(templates[templateId].packedTerms[24] >> 24),
                P(uint8(uint256(templates[templateId].packedTerms[24] >> 16))),
                (templates[templateId].packedTerms[24] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),
            IP(
                uint256(templates[templateId].packedTerms[25] >> 24),
                P(uint8(uint256(templates[templateId].packedTerms[25] >> 16))),
                (templates[templateId].packedTerms[25] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            )
        );
    }
}
