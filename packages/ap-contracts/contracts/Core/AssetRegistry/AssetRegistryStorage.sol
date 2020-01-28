pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "@atpar/actus-solidity/contracts/Core/Utils.sol";

import "../TemplateRegistry/ITemplateRegistry.sol";
import "../Conversions.sol";
import "../SharedTypes.sol";


/**
 * @title AssetRegistryStorage
 * @notice Describes the storage of the AssetRegistry
 * Contains getter and setter methods for encoding, decoding data to optimize gas cost
 */
contract AssetRegistryStorage is SharedTypes, Utils, Conversions {

    struct Asset {
        bytes32 assetId;
        AssetOwnership ownership;
        mapping (int8 => address) cashflowBeneficiaries;
        bytes32 templateId;
        mapping(uint8 => uint256) nextEventIndex;
        mapping (uint8 => bytes32) packedTermsState;
        uint256 overwrittenAttributesMap;
        // bytes32[] packedOverwrittenValues;
        uint256 eventId;
        address engine;
        address actor;
    }

    mapping (bytes32 => Asset) assets;

    ITemplateRegistry public templateRegistry;


    constructor(ITemplateRegistry _templateRegistry) public {
        templateRegistry = _templateRegistry;
    }

    function setAsset(
        bytes32 _assetId,
        AssetOwnership memory _ownership,
        bytes32 _templateId,
        CustomTerms memory customTerms,
        State memory state,
        address _engine,
        address _actor
    )
        internal
    {
        assets[_assetId] = Asset({
            assetId: _assetId,
            ownership: _ownership,
            templateId: _templateId,
            overwrittenAttributesMap: customTerms.overwrittenAttributesMap,
            // packedOverwrittenValues: customTerms.packedAttributeValues,
            eventId: 0,
            engine: _engine,
            actor: _actor
        });

        encodeAndSetTerms(_assetId, customTerms);
        encodeAndSetState(_assetId, state);
        encodeAndSetFinalizedState(_assetId, state);
    }

    function encodeAndSetTerms(bytes32 assetId, CustomTerms memory customTerms) internal {
        if (customTerms.anchorDate != uint256(0)) assets[assetId].packedTermsState[1] = bytes32(customTerms.anchorDate);

        assets[assetId].packedTermsState[2] = bytes32(customTerms.contractReference_1.object);
        assets[assetId].packedTermsState[3] =
            bytes32(uint256(customTerms.contractReference_1.contractReferenceType)) << 16 |
            bytes32(uint256(customTerms.contractReference_1.contractReferenceRole)) << 8;
        assets[assetId].packedTermsState[4] = bytes32(customTerms.contractReference_2.object);
        assets[assetId].packedTermsState[5] =
            bytes32(uint256(customTerms.contractReference_2.contractReferenceType)) << 16 |
            bytes32(uint256(customTerms.contractReference_2.contractReferenceRole)) << 8;

        // store overwritten attribute values
        // todo: tightly pack enum values
        for (uint256 i = 0; i < 35; i++) {
            if (customTerms.packedAttributeValues[i] == bytes32(0)) { continue; }
            assets[assetId].packedTermsState[uint8(i + 10)] = customTerms.packedAttributeValues[i];
        }

        // bytes32 enums;

        // for (uint8 i = 0; i < 256; i++) {
        //     // skip not overwritten attributes by checking if bit in map is not set
        //     if (!isOverwritten(terms.overwrittenAttributeMap, i)) { continue; }

        //     // retrieve value of overwritten attribute from packed bytes
        //     bytes32 value = decodeAttributeValueAsBytes32(terms.packedAttributeValues, i);

        //     // skip if value is 0
        //     if (value == bytes32(0)) { continue; }

        //     // pack enum values (first 9 attributes in LifecycleTerms)
        //     if (i <= 8) {
        //         enums |= value << (256 - (8 * i));
        //         continue;
        //     }

        //     // handle contract references (9th and 10th attributes in LifecycleTerms)
        //     if (i == 9) {
        //         assets[assetId].packedTermsState[4] = bytes32(terms.contractReference_1.object);
        //         assets[assetId].packedTermsState[5] =
        //             bytes32(uint256(terms.contractReference_1.contractReferenceType)) << 16 |
        //             bytes32(uint256(terms.contractReference_1.contractReferenceRole)) << 8;
        //         continue;
        //     }
        //     if (i == 10) {
        //         assets[assetId].packedTermsState[6] = bytes32(terms.contractReference_2.object);
        //         assets[assetId].packedTermsState[7] =
        //             bytes32(uint256(terms.contractReference_2.contractReferenceType)) << 16 |
        //             bytes32(uint256(terms.contractReference_2.contractReferenceRole)) << 8;
        //         continue;
        //     }

        //     // store remaining attributes with index equal to position in LifecycleTerms as is
        //     assets[assetId].packedTermsState[i] = value;
        // }

        // // store tightly packed enums
        // if (enums != bytes32(0)) assets[assetId].packedTermsState[3] = enums;
    }

    function encodeAndSetState(bytes32 assetId, State memory state) internal {
        bytes32 enums =
            bytes32(uint256(uint8(state.contractPerformance))) << 248;

        if (enums != bytes32(0)) assets[assetId].packedTermsState[101] = enums;

        if (state.statusDate != uint256(0)) assets[assetId].packedTermsState[102] = bytes32(state.statusDate);
        if (state.nonPerformingDate != uint256(0)) assets[assetId].packedTermsState[103] = bytes32(state.nonPerformingDate);
        if (state.maturityDate != uint256(0)) assets[assetId].packedTermsState[104] = bytes32(state.maturityDate);
        if (state.executionDate != uint256(0)) assets[assetId].packedTermsState[105] = bytes32(state.executionDate);

        if (state.notionalPrincipal != int256(0)) assets[assetId].packedTermsState[106] = bytes32(state.notionalPrincipal);
        if (state.accruedInterest != int256(0)) assets[assetId].packedTermsState[107] = bytes32(state.accruedInterest);
        if (state.feeAccrued != int256(0)) assets[assetId].packedTermsState[108] = bytes32(state.feeAccrued);
        if (state.nominalInterestRate != int256(0)) assets[assetId].packedTermsState[109] = bytes32(state.nominalInterestRate);
        if (state.interestScalingMultiplier != int256(0)) assets[assetId].packedTermsState[110] = bytes32(state.interestScalingMultiplier);
        if (state.notionalScalingMultiplier != int256(0)) assets[assetId].packedTermsState[111] = bytes32(state.notionalScalingMultiplier);
        // solium-disable-next-line
        if (state.nextPrincipalRedemptionPayment != int256(0)) assets[assetId].packedTermsState[112] = bytes32(state.nextPrincipalRedemptionPayment);
        if (state.executionAmount != int256(0)) assets[assetId].packedTermsState[113] = bytes32(state.executionAmount);
    }

    function encodeAndSetFinalizedState(bytes32 assetId, State memory state) internal {
        bytes32 enums =
            bytes32(uint256(uint8(state.contractPerformance))) << 248;

        if (enums != bytes32(0)) assets[assetId].packedTermsState[151] = enums;

        if (state.statusDate != uint256(0)) assets[assetId].packedTermsState[152] = bytes32(state.statusDate);
        if (state.nonPerformingDate != uint256(0)) assets[assetId].packedTermsState[153] = bytes32(state.nonPerformingDate);
        if (state.maturityDate != uint256(0)) assets[assetId].packedTermsState[154] = bytes32(state.maturityDate);
        if (state.executionDate != uint256(0)) assets[assetId].packedTermsState[155] = bytes32(state.executionDate);

        if (state.notionalPrincipal != int256(0)) assets[assetId].packedTermsState[156] = bytes32(state.notionalPrincipal);
        if (state.accruedInterest != int256(0)) assets[assetId].packedTermsState[157] = bytes32(state.accruedInterest);
        if (state.feeAccrued != int256(0)) assets[assetId].packedTermsState[158] = bytes32(state.feeAccrued);
        if (state.nominalInterestRate != int256(0)) assets[assetId].packedTermsState[159] = bytes32(state.nominalInterestRate);
        if (state.interestScalingMultiplier != int256(0)) assets[assetId].packedTermsState[160] = bytes32(state.interestScalingMultiplier);
        if (state.notionalScalingMultiplier != int256(0)) assets[assetId].packedTermsState[161] = bytes32(state.notionalScalingMultiplier);
        // solium-disable-next-line
        if (state.nextPrincipalRedemptionPayment != int256(0)) assets[assetId].packedTermsState[162] = bytes32(state.nextPrincipalRedemptionPayment);
        if (state.executionAmount != int256(0)) assets[assetId].packedTermsState[163] = bytes32(state.executionAmount);
    }

    function decodeAndGetTerms(bytes32 assetId) internal view returns (LifecycleTerms memory) {
        TemplateTerms memory templateTerms = templateRegistry.getTemplateTerms(assets[assetId].templateId);

        bytes32[] memory packedOverwrittenValues = new bytes32[](35);
        for (uint256 i = 0; i < 35; i++) {
            packedOverwrittenValues[i] = assets[assetId].packedTermsState[uint8(i + 10)];
        }

        CustomTerms memory customTerms = CustomTerms(
            uint256(assets[assetId].packedTermsState[1]),
            ContractReference(
                assets[assetId].packedTermsState[2],
                ContractReferenceType(uint8(uint256(assets[assetId].packedTermsState[3] >> 16))),
                ContractReferenceRole(uint8(uint256(assets[assetId].packedTermsState[3] >> 8)))
            ),
            ContractReference(
                assets[assetId].packedTermsState[4],
                ContractReferenceType(uint8(uint256(assets[assetId].packedTermsState[5] >> 16))),
                ContractReferenceRole(uint8(uint256(assets[assetId].packedTermsState[5] >> 8)))
            ),
            assets[assetId].overwrittenAttributesMap,
            packedOverwrittenValues
        );

        return deriveLifecycleTermsFromCustomTermsAndTemplateTerms(templateTerms, customTerms);

        // uint256 overwriteMap = uint256(assets[assetId].packedTermsState[1]);

        // return LifecycleTerms(
        //     isOverwritten(overwriteMap, 0) ? Calendar(uint8(uint256(assets[assetId].packedTermsState[3] >> 240))) : templateTerms.calendar,
        //     isOverwritten(overwriteMap, 1) ? ContractRole(uint8(uint256(assets[assetId].packedTermsState[3] >> 232))) : templateTerms.contractRole,
        //     isOverwritten(overwriteMap, 2) ? DayCountConvention(uint8(uint256(assets[assetId].packedTermsState[3] >> 224))) : templateTerms.dayCountConvention,
        //     isOverwritten(overwriteMap, 3) ? BusinessDayConvention(uint8(uint256(assets[assetId].packedTermsState[3] >> 216))) : templateTerms.businessDayConvention,
        //     isOverwritten(overwriteMap, 4) ? EndOfMonthConvention(uint8(uint256(assets[assetId].packedTermsState[3] >> 208))) : templateTerms.endOfMonthConvention,
        //     isOverwritten(overwriteMap, 5) ? ScalingEffect(uint8(uint256(assets[assetId].packedTermsState[3] >> 200))) : templateTerms.scalingEffect,
        //     isOverwritten(overwriteMap, 6) ? PenaltyType(uint8(uint256(assets[assetId].packedTermsState[3] >> 192))) : templateTerms.penaltyType,
        //     isOverwritten(overwriteMap, 7) ? FeeBasis(uint8(uint256(assets[assetId].packedTermsState[3] >> 184))) : templateTerms.feeBasis,
        //     isOverwritten(overwriteMap, 8) ? ContractPerformance(uint8(uint256(assets[assetId].packedTermsState[3] >> 176))) : templateTerms.creditEventTypeCovered,

        //     ContractReference(
        //         assets[assetId].packedTermsState[4],
        //         ContractReferenceType(uint8(uint256(assets[assetId].packedTermsState[5] >> 16))),
        //         ContractReferenceRole(uint8(uint256(assets[assetId].packedTermsState[5] >> 8)))
        //     ),
        //     ContractReference(
        //         assets[assetId].packedTermsState[6],
        //         ContractReferenceType(uint8(uint256(assets[assetId].packedTermsState[7] >> 16))),
        //         ContractReferenceRole(uint8(uint256(assets[assetId].packedTermsState[7] >> 8)))
        //     ),

        //     isOverwritten(overwriteMap, 11) ? address(uint160(uint256(assets[assetId].packedTermsState[11]) >> 96)) : templateTerms.currency,
        //     isOverwritten(overwriteMap, 12) ? address(uint160(uint256(assets[assetId].packedTermsState[12]) >> 96)) : templateTerms.settlementCurrency,

        //     isOverwritten(overwriteMap, 13) ? assets[assetId].packedTermsState[13] : templateTerms.marketObjectCodeRateReset,

        //     isOverwritten(overwriteMap, 14)
        //         ? uint256(assets[assetId].packedTermsState[14])
        //         : applyAnchorDateToOffset(uint256(assets[assetId].packedTermsState[2]), templateTerms.statusDateOffset),
        //     isOverwritten(overwriteMap, 15)
        //         ? uint256(assets[assetId].packedTermsState[15])
        //         : applyAnchorDateToOffset(uint256(assets[assetId].packedTermsState[2]), templateTerms.maturityDateOffset),

        //     isOverwritten(overwriteMap, 16) ? int256(assets[assetId].packedTermsState[16]) : templateTerms.notionalPrincipal,
        //     isOverwritten(overwriteMap, 17) ? int256(assets[assetId].packedTermsState[17]) : templateTerms.nominalInterestRate,
        //     isOverwritten(overwriteMap, 18) ? int256(assets[assetId].packedTermsState[18]) : templateTerms.feeAccrued,
        //     isOverwritten(overwriteMap, 19) ? int256(assets[assetId].packedTermsState[19]) : templateTerms.accruedInterest,
        //     isOverwritten(overwriteMap, 20) ? int256(assets[assetId].packedTermsState[20]) : templateTerms.rateMultiplier,
        //     isOverwritten(overwriteMap, 21) ? int256(assets[assetId].packedTermsState[21]) : templateTerms.rateSpread,
        //     isOverwritten(overwriteMap, 22) ? int256(assets[assetId].packedTermsState[22]) : templateTerms.feeRate,
        //     isOverwritten(overwriteMap, 23) ? int256(assets[assetId].packedTermsState[23]) : templateTerms.nextResetRate,
        //     isOverwritten(overwriteMap, 24) ? int256(assets[assetId].packedTermsState[24]) : templateTerms.penaltyRate,
        //     isOverwritten(overwriteMap, 25) ? int256(assets[assetId].packedTermsState[25]) : templateTerms.premiumDiscountAtIED,
        //     isOverwritten(overwriteMap, 26) ? int256(assets[assetId].packedTermsState[26]) : templateTerms.priceAtPurchaseDate,
        //     isOverwritten(overwriteMap, 27) ? int256(assets[assetId].packedTermsState[27]) : templateTerms.nextPrincipalRedemptionPayment,
        //     isOverwritten(overwriteMap, 28) ? int256(assets[assetId].packedTermsState[28]) : templateTerms.coverageOfCreditEnhancement,

        //     isOverwritten(overwriteMap, 29)
        //         ?
        //             IP(
        //                 uint256(assets[assetId].packedTermsState[29] >> 24),
        //                 P(uint8(uint256(assets[assetId].packedTermsState[29] >> 16))),
        //                 (assets[assetId].packedTermsState[29] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
        //             )
        //         : templateTerms.gracePeriod,
        //     isOverwritten(overwriteMap, 30)
        //         ?
        //             IP(
        //                 uint256(assets[assetId].packedTermsState[30] >> 24),
        //                 P(uint8(uint256(assets[assetId].packedTermsState[30] >> 16))),
        //                 (assets[assetId].packedTermsState[30] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
        //             )
        //         : templateTerms.delinquencyPeriod,

        //     isOverwritten(overwriteMap, 31) ? int256(assets[assetId].packedTermsState[31]) : templateTerms.lifeCap,
        //     isOverwritten(overwriteMap, 32) ? int256(assets[assetId].packedTermsState[32]) : templateTerms.lifeFloor,
        //     isOverwritten(overwriteMap, 33) ? int256(assets[assetId].packedTermsState[33]) : templateTerms.periodCap,
        //     isOverwritten(overwriteMap, 34) ? int256(assets[assetId].packedTermsState[34]) : templateTerms.periodFloor
        // );
    }

    function decodeAndGetAnchorDate(bytes32 assetId) internal view returns (uint256) {
        return uint256(assets[assetId].packedTermsState[1]);
    }

    function decodeAndGetState(bytes32 assetId) internal view returns (State memory) {
        return State(
            ContractPerformance(uint8(uint256(assets[assetId].packedTermsState[101] >> 248))),

            uint256(assets[assetId].packedTermsState[102]),
            uint256(assets[assetId].packedTermsState[103]),
            uint256(assets[assetId].packedTermsState[104]),
            uint256(assets[assetId].packedTermsState[105]),

            int256(assets[assetId].packedTermsState[106]),
            int256(assets[assetId].packedTermsState[107]),
            int256(assets[assetId].packedTermsState[108]),
            int256(assets[assetId].packedTermsState[109]),
            int256(assets[assetId].packedTermsState[110]),
            int256(assets[assetId].packedTermsState[111]),
            int256(assets[assetId].packedTermsState[112]),
            int256(assets[assetId].packedTermsState[113])
        );
    }

    function decodeAndGetFinalizedState(bytes32 assetId) internal view returns (State memory) {
        return State(
            ContractPerformance(uint8(uint256(assets[assetId].packedTermsState[151] >> 248))),

            uint256(assets[assetId].packedTermsState[152]),
            uint256(assets[assetId].packedTermsState[153]),
            uint256(assets[assetId].packedTermsState[154]),
            uint256(assets[assetId].packedTermsState[155]),

            int256(assets[assetId].packedTermsState[156]),
            int256(assets[assetId].packedTermsState[157]),
            int256(assets[assetId].packedTermsState[158]),
            int256(assets[assetId].packedTermsState[159]),
            int256(assets[assetId].packedTermsState[160]),
            int256(assets[assetId].packedTermsState[161]),
            int256(assets[assetId].packedTermsState[162]),
            int256(assets[assetId].packedTermsState[163])
        );
    }
}
