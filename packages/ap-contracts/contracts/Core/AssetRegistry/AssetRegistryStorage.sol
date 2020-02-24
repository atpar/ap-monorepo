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

        bytes32 enums =
            bytes32(uint256(uint8(customTerms.overwrittenTerms.calendar))) << 240 |
            bytes32(uint256(uint8(customTerms.overwrittenTerms.contractRole))) << 232 |
            bytes32(uint256(uint8(customTerms.overwrittenTerms.dayCountConvention))) << 224 |
            bytes32(uint256(uint8(customTerms.overwrittenTerms.businessDayConvention))) << 216 |
            bytes32(uint256(uint8(customTerms.overwrittenTerms.endOfMonthConvention))) << 208 |
            bytes32(uint256(uint8(customTerms.overwrittenTerms.scalingEffect))) << 200 |
            bytes32(uint256(uint8(customTerms.overwrittenTerms.penaltyType))) << 192 |
            bytes32(uint256(uint8(customTerms.overwrittenTerms.feeBasis))) << 184 |
            bytes32(uint256(uint8(customTerms.overwrittenTerms.creditEventTypeCovered))) << 176;

        if (enums != bytes32(0)) assets[assetId].packedTermsState[2] = enums;

        if (customTerms.overwrittenTerms.currency != address(0)) assets[assetId].packedTermsState[4] = bytes32(uint256(customTerms.overwrittenTerms.currency) << 96);
        if (customTerms.overwrittenTerms.settlementCurrency != address(0)) assets[assetId].packedTermsState[5] = bytes32(uint256(customTerms.overwrittenTerms.settlementCurrency) << 96);

        if (customTerms.overwrittenTerms.marketObjectCodeRateReset != bytes32(0)) assets[assetId].packedTermsState[6] = bytes32(customTerms.overwrittenTerms.marketObjectCodeRateReset);

        if (customTerms.overwrittenTerms.statusDate != uint256(0)) assets[assetId].packedTermsState[7] = bytes32(customTerms.overwrittenTerms.statusDate);
        if (customTerms.overwrittenTerms.maturityDate != uint256(0)) assets[assetId].packedTermsState[8] = bytes32(customTerms.overwrittenTerms.maturityDate);

        if (customTerms.overwrittenTerms.notionalPrincipal != int256(0)) assets[assetId].packedTermsState[17] = bytes32(customTerms.overwrittenTerms.notionalPrincipal);
        if (customTerms.overwrittenTerms.nominalInterestRate != int256(0)) assets[assetId].packedTermsState[18] = bytes32(customTerms.overwrittenTerms.nominalInterestRate);
        if (customTerms.overwrittenTerms.feeAccrued != int256(0)) assets[assetId].packedTermsState[19] = bytes32(customTerms.overwrittenTerms.feeAccrued);
        if (customTerms.overwrittenTerms.accruedInterest != int256(0)) assets[assetId].packedTermsState[20] = bytes32(customTerms.overwrittenTerms.accruedInterest);
        if (customTerms.overwrittenTerms.rateMultiplier != int256(0)) assets[assetId].packedTermsState[21] = bytes32(customTerms.overwrittenTerms.rateMultiplier);
        if (customTerms.overwrittenTerms.rateSpread != int256(0)) assets[assetId].packedTermsState[22] = bytes32(customTerms.overwrittenTerms.rateSpread);
        if (customTerms.overwrittenTerms.feeRate != int256(0)) assets[assetId].packedTermsState[23] = bytes32(customTerms.overwrittenTerms.feeRate);
        if (customTerms.overwrittenTerms.nextResetRate != int256(0)) assets[assetId].packedTermsState[24] = bytes32(customTerms.overwrittenTerms.nextResetRate);
        if (customTerms.overwrittenTerms.penaltyRate != int256(0)) assets[assetId].packedTermsState[25] = bytes32(customTerms.overwrittenTerms.penaltyRate);
        if (customTerms.overwrittenTerms.premiumDiscountAtIED != int256(0)) assets[assetId].packedTermsState[26] = bytes32(customTerms.overwrittenTerms.premiumDiscountAtIED);
        if (customTerms.overwrittenTerms.priceAtPurchaseDate != int256(0)) assets[assetId].packedTermsState[27] = bytes32(customTerms.overwrittenTerms.priceAtPurchaseDate);
        // solium-disable-next-line
        if (customTerms.overwrittenTerms.nextPrincipalRedemptionPayment != int256(0)) assets[assetId].packedTermsState[28] = bytes32(customTerms.overwrittenTerms.nextPrincipalRedemptionPayment);
        // solium-disable-next-line
        if (customTerms.overwrittenTerms.coverageOfCreditEnhancement != int256(0)) assets[assetId].packedTermsState[29] = bytes32(customTerms.overwrittenTerms.coverageOfCreditEnhancement);
        if (customTerms.overwrittenTerms.lifeCap != int256(0)) assets[assetId].packedTermsState[30] = bytes32(customTerms.overwrittenTerms.lifeCap);
        if (customTerms.overwrittenTerms.lifeFloor != int256(0)) assets[assetId].packedTermsState[31] = bytes32(customTerms.overwrittenTerms.lifeFloor);
        if (customTerms.overwrittenTerms.periodCap != int256(0)) assets[assetId].packedTermsState[32] = bytes32(customTerms.overwrittenTerms.periodCap);
        if (customTerms.overwrittenTerms.periodFloor != int256(0)) assets[assetId].packedTermsState[33] = bytes32(customTerms.overwrittenTerms.periodFloor);

        if (customTerms.overwrittenTerms.gracePeriod.isSet) {
            assets[assetId].packedTermsState[34] =
                bytes32(uint256(customTerms.overwrittenTerms.gracePeriod.i)) << 24 |
                bytes32(uint256(customTerms.overwrittenTerms.gracePeriod.p)) << 16 |
                bytes32(uint256(1)) << 8;
        }
        if (customTerms.overwrittenTerms.delinquencyPeriod.isSet) {
            assets[assetId].packedTermsState[35] =
                bytes32(uint256(customTerms.overwrittenTerms.delinquencyPeriod.i)) << 24 |
                bytes32(uint256(customTerms.overwrittenTerms.delinquencyPeriod.p)) << 16 |
                bytes32(uint256(1)) << 8;
        }

        if (customTerms.overwrittenTerms.contractReference_1.object != bytes32(0)) {
            assets[assetId].packedTermsState[36] = bytes32(customTerms.overwrittenTerms.contractReference_1.object);
            assets[assetId].packedTermsState[37] =
                bytes32(uint256(customTerms.overwrittenTerms.contractReference_1.contractReferenceType)) << 16 |
                bytes32(uint256(customTerms.overwrittenTerms.contractReference_1.contractReferenceRole)) << 8;

        }
        if (customTerms.overwrittenTerms.contractReference_2.object != bytes32(0)) {
            assets[assetId].packedTermsState[38] = bytes32(customTerms.overwrittenTerms.contractReference_2.object);
            assets[assetId].packedTermsState[39] =
                bytes32(uint256(customTerms.overwrittenTerms.contractReference_2.contractReferenceType)) << 16 |
                bytes32(uint256(customTerms.overwrittenTerms.contractReference_2.contractReferenceRole)) << 8;

        }
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
        // load templateTerms from TemplateRegistry
        TemplateTerms memory templateTerms = templateRegistry.getTemplateTerms(assets[assetId].templateId);

        CustomTerms memory customTerms = CustomTerms(
            // load anchorDate
            uint256(assets[assetId].packedTermsState[1]),
            // laod map of overwritten attributes
            assets[assetId].overwrittenAttributesMap,
            // load overwritten values
            LifecycleTerms(
                Calendar(uint8(uint256(assets[assetId].packedTermsState[2] >> 240))),
                ContractRole(uint8(uint256(assets[assetId].packedTermsState[2] >> 232))),
                DayCountConvention(uint8(uint256(assets[assetId].packedTermsState[2] >> 224))),
                BusinessDayConvention(uint8(uint256(assets[assetId].packedTermsState[2] >> 216))),
                EndOfMonthConvention(uint8(uint256(assets[assetId].packedTermsState[2] >> 208))),
                ScalingEffect(uint8(uint256(assets[assetId].packedTermsState[2] >> 200))),
                PenaltyType(uint8(uint256(assets[assetId].packedTermsState[2] >> 192))),
                FeeBasis(uint8(uint256(assets[assetId].packedTermsState[2] >> 184))),
                ContractPerformance(uint8(uint256(assets[assetId].packedTermsState[2] >> 176))),

                address(uint160(uint256(assets[assetId].packedTermsState[4]) >> 96)),
                address(uint160(uint256(assets[assetId].packedTermsState[5]) >> 96)),

                assets[assetId].packedTermsState[6],

                uint256(assets[assetId].packedTermsState[7]),
                uint256(assets[assetId].packedTermsState[8]),
                int256(assets[assetId].packedTermsState[17]),
                int256(assets[assetId].packedTermsState[18]),
                int256(assets[assetId].packedTermsState[19]),
                int256(assets[assetId].packedTermsState[20]),
                int256(assets[assetId].packedTermsState[21]),
                int256(assets[assetId].packedTermsState[22]),
                int256(assets[assetId].packedTermsState[23]),
                int256(assets[assetId].packedTermsState[24]),
                int256(assets[assetId].packedTermsState[25]),
                int256(assets[assetId].packedTermsState[26]),
                int256(assets[assetId].packedTermsState[27]),
                int256(assets[assetId].packedTermsState[28]),
                int256(assets[assetId].packedTermsState[29]),
                int256(assets[assetId].packedTermsState[30]),
                int256(assets[assetId].packedTermsState[31]),
                int256(assets[assetId].packedTermsState[32]),
                int256(assets[assetId].packedTermsState[33]),

                IP(
                    uint256(assets[assetId].packedTermsState[34] >> 24),
                    P(uint8(uint256(assets[assetId].packedTermsState[34] >> 16))),
                    (assets[assetId].packedTermsState[34] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
                ),
                IP(
                    uint256(assets[assetId].packedTermsState[35] >> 24),
                    P(uint8(uint256(assets[assetId].packedTermsState[35] >> 16))),
                    (assets[assetId].packedTermsState[35] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
                ),
                ContractReference(
                    assets[assetId].packedTermsState[36],
                    ContractReferenceType(uint8(uint256(assets[assetId].packedTermsState[37] >> 16))),
                    ContractReferenceRole(uint8(uint256(assets[assetId].packedTermsState[37] >> 8)))
                ),
                ContractReference(
                    assets[assetId].packedTermsState[38],
                    ContractReferenceType(uint8(uint256(assets[assetId].packedTermsState[39] >> 16))),
                    ContractReferenceRole(uint8(uint256(assets[assetId].packedTermsState[39] >> 8)))
                )
            )
        );

        // derive lifecycleTerms
        return deriveLifecycleTermsFromCustomTermsAndTemplateTerms(templateTerms, customTerms);
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
