pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "@atpar/actus-solidity/contracts/Core/Utils.sol";

import "../TemplateRegistry/ITemplateRegistry.sol";
import "../Conversions.sol";
import "../SharedTypes.sol";


/**
 * @title AssetRegistryStorage
 * @notice Describes the storage of the AssetRegistry
 * Contains getter and setter methods for encoding, decoding data to optimize gas cost.
 * Circumvents storing default values by relying on the characteristic of mappings returning zero for not set values.
 */
contract AssetRegistryStorage is SharedTypes, Utils, Conversions {

    struct Asset {
        // boolean indicating that asset exists / is registered
        bool isSet;
        // Id of template registered in the TemplateRegistry
        bytes32 templateId;
        // last event which could not be settled
        bytes32 pendingEvent;
        // pointer to index of the next event in the template schedule
        uint256 nextScheduleIndex;
        // binary encoded map of the LifecycleTerms attributes which overwrite the values defined in TemplateTerms
        uint256 overwrittenAttributesMap;
        // address of the ACTUS Engine used for computing the State and the Payoff of the asset
        address engine;
        // address of the Asset Actor which is allowed to update the State of the asset
        address actor;
        // ownership of the asset
        AssetOwnership ownership;
        // granular ownership of the event type specific cashflows
        // per default owners are beneficiaries defined in ownership object
        // cashflow id (:= (EventType index + 1) * direction) => owner
        mapping (int8 => address) cashflowBeneficiaries;
        // method level access control - stores which address can a specific method
        // method signature => address => has access
        mapping (bytes4 => mapping (address => bool)) access;
        // tightly packed, encoded LifecycleTerms and State values of the asset
        // bytes32(0) used as default value for each attribute
        // storage id => bytes32 encoded value
        mapping (uint8 => bytes32) packedTermsState;
    }

    // AssetId => Asset
    mapping (bytes32 => Asset) internal assets;

    ITemplateRegistry public templateRegistry;


    constructor(ITemplateRegistry _templateRegistry) public {
        templateRegistry = _templateRegistry;
    }

    /**
     * @dev Store asset data by efficiently storing the CustomTerms and the inital State of the asset
     */
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
            isSet: true,
            templateId: _templateId,
            pendingEvent: bytes32(0),
            nextScheduleIndex: 0,
            overwrittenAttributesMap: customTerms.overwrittenAttributesMap,
            engine: _engine,
            actor: _actor,
            ownership: _ownership
        });

        encodeAndSetTerms(_assetId, customTerms);
        encodeAndSetState(_assetId, state);
        encodeAndSetFinalizedState(_assetId, state);
    }

    /**
     * @dev Encode and set the anchorDate of the customTerms
     */
    function encodeAndSetAnchorDate(bytes32 assetId, uint256 anchorDate) internal {
        assets[assetId].packedTermsState[1] = bytes32(anchorDate);
    }

    /**
     * @dev Tightly pack and store only non-zero overwritten terms (LifecycleTerms)
     * @notice All non zero values of the overwrittenTerms object are stored.
     * It does not check if overwrittenAttributesMap actually marks attribute as overwritten.
     */
    function encodeAndSetTerms(bytes32 assetId, CustomTerms memory customTerms) internal {
        storeInPackedStateTerms(assetId, 1, bytes32(customTerms.anchorDate));

        storeInPackedStateTerms(
            assetId,
            2,
            bytes32(uint256(uint8(customTerms.overwrittenTerms.calendar))) << 248 |
            bytes32(uint256(uint8(customTerms.overwrittenTerms.contractRole))) << 240 |
            bytes32(uint256(uint8(customTerms.overwrittenTerms.dayCountConvention))) << 232 |
            bytes32(uint256(uint8(customTerms.overwrittenTerms.businessDayConvention))) << 224 |
            bytes32(uint256(uint8(customTerms.overwrittenTerms.endOfMonthConvention))) << 216 |
            bytes32(uint256(uint8(customTerms.overwrittenTerms.scalingEffect))) << 208 |
            bytes32(uint256(uint8(customTerms.overwrittenTerms.penaltyType))) << 200 |
            bytes32(uint256(uint8(customTerms.overwrittenTerms.feeBasis))) << 192 |
            bytes32(uint256(uint8(customTerms.overwrittenTerms.creditEventTypeCovered))) << 184
        );

        storeInPackedStateTerms(assetId, 3, bytes32(uint256(customTerms.overwrittenTerms.currency) << 96));
        storeInPackedStateTerms(assetId, 4, bytes32(uint256(customTerms.overwrittenTerms.settlementCurrency) << 96));

        storeInPackedStateTerms(assetId, 5, bytes32(customTerms.overwrittenTerms.marketObjectCodeRateReset));
        storeInPackedStateTerms(assetId, 6, bytes32(customTerms.overwrittenTerms.statusDate));
        storeInPackedStateTerms(assetId, 7, bytes32(customTerms.overwrittenTerms.maturityDate));
        storeInPackedStateTerms(assetId, 8, bytes32(customTerms.overwrittenTerms.notionalPrincipal));
        storeInPackedStateTerms(assetId, 9, bytes32(customTerms.overwrittenTerms.nominalInterestRate));
        storeInPackedStateTerms(assetId, 10, bytes32(customTerms.overwrittenTerms.feeAccrued));
        storeInPackedStateTerms(assetId, 11, bytes32(customTerms.overwrittenTerms.accruedInterest));
        storeInPackedStateTerms(assetId, 12, bytes32(customTerms.overwrittenTerms.rateMultiplier));
        storeInPackedStateTerms(assetId, 13, bytes32(customTerms.overwrittenTerms.rateSpread));
        storeInPackedStateTerms(assetId, 14, bytes32(customTerms.overwrittenTerms.feeRate));
        storeInPackedStateTerms(assetId, 15, bytes32(customTerms.overwrittenTerms.nextResetRate));
        storeInPackedStateTerms(assetId, 16, bytes32(customTerms.overwrittenTerms.penaltyRate));
        storeInPackedStateTerms(assetId, 17, bytes32(customTerms.overwrittenTerms.premiumDiscountAtIED));
        storeInPackedStateTerms(assetId, 18, bytes32(customTerms.overwrittenTerms.priceAtPurchaseDate));
        storeInPackedStateTerms(assetId, 19, bytes32(customTerms.overwrittenTerms.nextPrincipalRedemptionPayment));
        storeInPackedStateTerms(assetId, 20, bytes32(customTerms.overwrittenTerms.coverageOfCreditEnhancement));
        storeInPackedStateTerms(assetId, 21, bytes32(customTerms.overwrittenTerms.lifeCap));
        storeInPackedStateTerms(assetId, 22, bytes32(customTerms.overwrittenTerms.lifeFloor));
        storeInPackedStateTerms(assetId, 23, bytes32(customTerms.overwrittenTerms.periodCap));
        storeInPackedStateTerms(assetId, 24, bytes32(customTerms.overwrittenTerms.periodFloor));

        storeInPackedStateTerms(
            assetId,
            25,
            bytes32(uint256(customTerms.overwrittenTerms.gracePeriod.i)) << 24 |
            bytes32(uint256(customTerms.overwrittenTerms.gracePeriod.p)) << 16 |
            bytes32(uint256((customTerms.overwrittenTerms.gracePeriod.isSet) ? 1 : 0)) << 8
        );
        storeInPackedStateTerms(
            assetId,
            26,
            bytes32(uint256(customTerms.overwrittenTerms.delinquencyPeriod.i)) << 24 |
            bytes32(uint256(customTerms.overwrittenTerms.delinquencyPeriod.p)) << 16 |
            bytes32(uint256((customTerms.overwrittenTerms.delinquencyPeriod.isSet) ? 1 : 0)) << 8
        );

        storeInPackedStateTerms(
            assetId,
            27,
            bytes32(customTerms.overwrittenTerms.contractReference_1.object)
        );
        storeInPackedStateTerms(
            assetId,
            28,
            bytes32(uint256(customTerms.overwrittenTerms.contractReference_1._type)) << 16 |
            bytes32(uint256(customTerms.overwrittenTerms.contractReference_1.role)) << 8
        );
        storeInPackedStateTerms(
            assetId,
            29,
            bytes32(customTerms.overwrittenTerms.contractReference_2.object)
        );
        storeInPackedStateTerms(
            assetId,
            30,
            bytes32(uint256(customTerms.overwrittenTerms.contractReference_2._type)) << 16 |
            bytes32(uint256(customTerms.overwrittenTerms.contractReference_2.role)) << 8
        );
    }

    /**
     * @dev Tightly pack and store State
     */
    function encodeAndSetState(bytes32 assetId, State memory state) internal {
        storeInPackedStateTerms(assetId, 101, bytes32(uint256(uint8(state.contractPerformance))) << 248);
        storeInPackedStateTerms(assetId, 102, bytes32(state.statusDate));
        storeInPackedStateTerms(assetId, 103, bytes32(state.nonPerformingDate));
        storeInPackedStateTerms(assetId, 104, bytes32(state.maturityDate));
        storeInPackedStateTerms(assetId, 105, bytes32(state.exerciseDate));
        storeInPackedStateTerms(assetId, 106, bytes32(state.terminationDate));
        storeInPackedStateTerms(assetId, 107, bytes32(state.notionalPrincipal));
        storeInPackedStateTerms(assetId, 108, bytes32(state.accruedInterest));
        storeInPackedStateTerms(assetId, 109, bytes32(state.feeAccrued));
        storeInPackedStateTerms(assetId, 110, bytes32(state.nominalInterestRate));
        storeInPackedStateTerms(assetId, 111, bytes32(state.interestScalingMultiplier));
        storeInPackedStateTerms(assetId, 112, bytes32(state.notionalScalingMultiplier));
        storeInPackedStateTerms(assetId, 113, bytes32(state.nextPrincipalRedemptionPayment));
        storeInPackedStateTerms(assetId, 114, bytes32(state.exerciseAmount));
    }

    /**
     * @dev Tightly pack and store finalized State
     */
    function encodeAndSetFinalizedState(bytes32 assetId, State memory state) internal {
        storeInPackedStateTerms(assetId, 151, bytes32(uint256(uint8(state.contractPerformance))) << 248);
        storeInPackedStateTerms(assetId, 152, bytes32(state.statusDate));
        storeInPackedStateTerms(assetId, 153, bytes32(state.nonPerformingDate));
        storeInPackedStateTerms(assetId, 154, bytes32(state.maturityDate));
        storeInPackedStateTerms(assetId, 155, bytes32(state.exerciseDate));
        storeInPackedStateTerms(assetId, 156, bytes32(state.terminationDate));
        storeInPackedStateTerms(assetId, 157, bytes32(state.notionalPrincipal));
        storeInPackedStateTerms(assetId, 158, bytes32(state.accruedInterest));
        storeInPackedStateTerms(assetId, 159, bytes32(state.feeAccrued));
        storeInPackedStateTerms(assetId, 160, bytes32(state.nominalInterestRate));
        storeInPackedStateTerms(assetId, 161, bytes32(state.interestScalingMultiplier));
        storeInPackedStateTerms(assetId, 162, bytes32(state.notionalScalingMultiplier));
        storeInPackedStateTerms(assetId, 163, bytes32(state.nextPrincipalRedemptionPayment));
        storeInPackedStateTerms(assetId, 164, bytes32(state.exerciseAmount));
    }

    /**
     * @dev Decode and load the anchorDate of the customTerms
     */
    function decodeAndGetAnchorDate(bytes32 assetId) internal view returns (uint256) {
        return uint256(assets[assetId].packedTermsState[1]);
    }

    /**
     * @dev Decode and load overwritten Terms (LifecycleTerms) and return it as CustomTerms
     */
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
                Calendar(uint8(uint256(assets[assetId].packedTermsState[2] >> 248))),
                ContractRole(uint8(uint256(assets[assetId].packedTermsState[2] >> 240))),
                DayCountConvention(uint8(uint256(assets[assetId].packedTermsState[2] >> 232))),
                BusinessDayConvention(uint8(uint256(assets[assetId].packedTermsState[2] >> 224))),
                EndOfMonthConvention(uint8(uint256(assets[assetId].packedTermsState[2] >> 216))),
                ScalingEffect(uint8(uint256(assets[assetId].packedTermsState[2] >> 208))),
                PenaltyType(uint8(uint256(assets[assetId].packedTermsState[2] >> 200))),
                FeeBasis(uint8(uint256(assets[assetId].packedTermsState[2] >> 192))),
                ContractPerformance(uint8(uint256(assets[assetId].packedTermsState[2] >> 184))),

                address(uint160(uint256(assets[assetId].packedTermsState[3]) >> 96)),
                address(uint160(uint256(assets[assetId].packedTermsState[4]) >> 96)),

                assets[assetId].packedTermsState[5],

                uint256(assets[assetId].packedTermsState[6]),
                uint256(assets[assetId].packedTermsState[7]),
                int256(assets[assetId].packedTermsState[8]),
                int256(assets[assetId].packedTermsState[9]),
                int256(assets[assetId].packedTermsState[10]),
                int256(assets[assetId].packedTermsState[11]),
                int256(assets[assetId].packedTermsState[12]),
                int256(assets[assetId].packedTermsState[13]),
                int256(assets[assetId].packedTermsState[14]),
                int256(assets[assetId].packedTermsState[15]),
                int256(assets[assetId].packedTermsState[16]),
                int256(assets[assetId].packedTermsState[17]),
                int256(assets[assetId].packedTermsState[18]),
                int256(assets[assetId].packedTermsState[19]),
                int256(assets[assetId].packedTermsState[20]),
                int256(assets[assetId].packedTermsState[21]),
                int256(assets[assetId].packedTermsState[22]),
                int256(assets[assetId].packedTermsState[23]),
                int256(assets[assetId].packedTermsState[24]),

                IP(
                    uint256(assets[assetId].packedTermsState[25] >> 24),
                    P(uint8(uint256(assets[assetId].packedTermsState[25] >> 16))),
                    (assets[assetId].packedTermsState[25] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
                ),
                IP(
                    uint256(assets[assetId].packedTermsState[26] >> 24),
                    P(uint8(uint256(assets[assetId].packedTermsState[26] >> 16))),
                    (assets[assetId].packedTermsState[26] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
                ),
                ContractReference(
                    assets[assetId].packedTermsState[27],
                    ContractReferenceType(uint8(uint256(assets[assetId].packedTermsState[28] >> 16))),
                    ContractReferenceRole(uint8(uint256(assets[assetId].packedTermsState[28] >> 8)))
                ),
                ContractReference(
                    assets[assetId].packedTermsState[29],
                    ContractReferenceType(uint8(uint256(assets[assetId].packedTermsState[30] >> 16))),
                    ContractReferenceRole(uint8(uint256(assets[assetId].packedTermsState[30] >> 8)))
                )
            )
        );

        // return LifecycleTerms of the asset by deriving it from the TemplateTerms and overwritten terms in CustomTerms
        return deriveLifecycleTermsFromCustomTermsAndTemplateTerms(templateTerms, customTerms);
    }

    /**
     * @dev Decode and load the State of the asset
     */
    function decodeAndGetState(bytes32 assetId) internal view returns (State memory) {
        return State(
            ContractPerformance(uint8(uint256(assets[assetId].packedTermsState[101] >> 248))),

            uint256(assets[assetId].packedTermsState[102]),
            uint256(assets[assetId].packedTermsState[103]),
            uint256(assets[assetId].packedTermsState[104]),
            uint256(assets[assetId].packedTermsState[105]),
            uint256(assets[assetId].packedTermsState[106]),

            int256(assets[assetId].packedTermsState[107]),
            int256(assets[assetId].packedTermsState[108]),
            int256(assets[assetId].packedTermsState[109]),
            int256(assets[assetId].packedTermsState[110]),
            int256(assets[assetId].packedTermsState[111]),
            int256(assets[assetId].packedTermsState[112]),
            int256(assets[assetId].packedTermsState[113]),
            int256(assets[assetId].packedTermsState[114])
        );
    }

    /**
     * @dev Decode and load the finalized State of the asset
     */
    function decodeAndGetFinalizedState(bytes32 assetId) internal view returns (State memory) {
        return State(
            ContractPerformance(uint8(uint256(assets[assetId].packedTermsState[151] >> 248))),

            uint256(assets[assetId].packedTermsState[152]),
            uint256(assets[assetId].packedTermsState[153]),
            uint256(assets[assetId].packedTermsState[154]),
            uint256(assets[assetId].packedTermsState[155]),
            uint256(assets[assetId].packedTermsState[156]),

            int256(assets[assetId].packedTermsState[157]),
            int256(assets[assetId].packedTermsState[158]),
            int256(assets[assetId].packedTermsState[159]),
            int256(assets[assetId].packedTermsState[160]),
            int256(assets[assetId].packedTermsState[161]),
            int256(assets[assetId].packedTermsState[162]),
            int256(assets[assetId].packedTermsState[163]),
            int256(assets[assetId].packedTermsState[164])
        );
    }

    function storeInPackedStateTerms(bytes32 assetId, uint8 index, bytes32 value) private {
        if (assets[assetId].packedTermsState[index] == value) return;
        assets[assetId].packedTermsState[index] = value;
    }
}
