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
            eventId: 0,
            engine: _engine,
            actor: _actor
        });

        encodeAndSetTerms(_assetId, customTerms);
        encodeAndSetState(_assetId, state);
        encodeAndSetFinalizedState(_assetId, state);
    }

    function encodeAndSetTerms(bytes32 assetId, CustomTerms memory terms) internal {
        if (terms.anchorDate != uint256(0)) assets[assetId].packedTermsState[1] = bytes32(terms.anchorDate);
        if (terms.notionalPrincipal != int256(0)) assets[assetId].packedTermsState[2] = bytes32(terms.notionalPrincipal);
        if (terms.nominalInterestRate != int256(0)) assets[assetId].packedTermsState[3] = bytes32(terms.nominalInterestRate);
        if (terms.premiumDiscountAtIED != int256(0)) assets[assetId].packedTermsState[4] = bytes32(terms.premiumDiscountAtIED);
        if (terms.rateSpread != int256(0)) assets[assetId].packedTermsState[5] = bytes32(terms.rateSpread);
        if (terms.lifeCap != int256(0)) assets[assetId].packedTermsState[6] = bytes32(terms.lifeCap);
        if (terms.lifeFloor != int256(0)) assets[assetId].packedTermsState[7] = bytes32(terms.lifeFloor);
        if (terms.coverageOfCreditEnhancement != int256(0)) assets[assetId].packedTermsState[8] = bytes32(terms.coverageOfCreditEnhancement);
        if (terms.contractReference_1.object != bytes32(0)) {
            assets[assetId].packedTermsState[9] = bytes32(terms.contractReference_1.object);
            assets[assetId].packedTermsState[10] =
                bytes32(uint256(terms.contractReference_1.contractReferenceType)) << 16 |
                bytes32(uint256(terms.contractReference_1.contractReferenceRole)) << 8;
        }
        if (terms.contractReference_2.object != bytes32(0)) {
            assets[assetId].packedTermsState[11] = bytes32(terms.contractReference_2.object);
            assets[assetId].packedTermsState[12] =
                bytes32(uint256(terms.contractReference_2.contractReferenceType)) << 16 |
                bytes32(uint256(terms.contractReference_2.contractReferenceRole)) << 8;
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
        CustomTerms memory customTerms = CustomTerms(
            uint256(assets[assetId].packedTermsState[1]),
            int256(assets[assetId].packedTermsState[2]),
            int256(assets[assetId].packedTermsState[3]),
            int256(assets[assetId].packedTermsState[4]),
            int256(assets[assetId].packedTermsState[5]),
            int256(assets[assetId].packedTermsState[6]),
            int256(assets[assetId].packedTermsState[7]),
            int256(assets[assetId].packedTermsState[8]),
            ContractReference(
                assets[assetId].packedTermsState[9],
                ContractReferenceType(uint8(uint256(assets[assetId].packedTermsState[10] >> 16))),
                ContractReferenceRole(uint8(uint256(assets[assetId].packedTermsState[10] >> 8)))
            ),
            ContractReference(
                assets[assetId].packedTermsState[11],
                ContractReferenceType(uint8(uint256(assets[assetId].packedTermsState[12] >> 16))),
                ContractReferenceRole(uint8(uint256(assets[assetId].packedTermsState[12] >> 8)))
            )
        );

        return deriveLifecycleTerms(
            templateRegistry.getTemplateTerms(assets[assetId].templateId),
            customTerms
        );
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
