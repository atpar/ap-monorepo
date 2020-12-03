// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../Base/SharedTypes.sol";
import "../Base/AssetRegistry/BaseRegistryStorage.sol";


library CECEncoder {

    function storeInPackedTerms(Asset storage asset, bytes32 attributeKey, bytes32 value) private {
        // skip if value did not change
        if (asset.packedTerms[attributeKey] == value) return;
        asset.packedTerms[attributeKey] = value;
    }

    function storeInPackedState(Asset storage asset, bytes32 attributeKey, bytes32 value) private {
        // skip if value did not change
        if (asset.packedState[attributeKey] == value) return;
        asset.packedState[attributeKey] = value;
    }
    
    /**
     * @dev Tightly pack and store only non-zero overwritten terms (LifecycleTerms)
     * @notice All non zero values of the overwrittenTerms object are stored.
     * It does not check if overwrittenAttributesMap actually marks attribute as overwritten.
     */
    function encodeAndSetCECTerms(Asset storage asset, CECTerms memory terms) external {
        storeInPackedTerms(
            asset,
            "enums",
            bytes32(uint256(uint8(terms.contractType))) << 248 |
            bytes32(uint256(uint8(terms.calendar))) << 240 |
            bytes32(uint256(uint8(terms.contractRole))) << 232 |
            bytes32(uint256(uint8(terms.dayCountConvention))) << 224 |
            bytes32(uint256(uint8(terms.businessDayConvention))) << 216 |
            bytes32(uint256(uint8(terms.endOfMonthConvention))) << 208 |
            bytes32(uint256(uint8(terms.creditEventTypeCovered))) << 200 |
            bytes32(uint256(uint8(terms.feeBasis))) << 192
        );

        storeInPackedTerms(asset, "statusDate", bytes32(terms.statusDate));
        storeInPackedTerms(asset, "maturityDate", bytes32(terms.maturityDate));

        storeInPackedTerms(asset, "notionalPrincipal", bytes32(terms.notionalPrincipal));
        
        storeInPackedTerms(asset, "feeRate", bytes32(terms.feeRate));
        storeInPackedTerms(asset, "coverageOfCreditEnhancement", bytes32(terms.coverageOfCreditEnhancement));

        storeInPackedTerms(
            asset,
            "contractReference_1_type_role",
            bytes32(uint256(terms.contractReference_1._type)) << 16 |
            bytes32(uint256(terms.contractReference_1.role)) << 8
        );

        storeInPackedTerms(
            asset,
            "contractReference_1_object",
            terms.contractReference_1.object
        );
        storeInPackedTerms(
            asset,
            "contractReference_1_object2",
            terms.contractReference_1.object2
        );

        storeInPackedTerms(
            asset,
            "contractReference_2_type_role",
            bytes32(uint256(terms.contractReference_2._type)) << 16 |
            bytes32(uint256(terms.contractReference_2.role)) << 8
        );

        storeInPackedTerms(
            asset,
            "contractReference_2_object",
            terms.contractReference_2.object
        );
        storeInPackedTerms(
            asset,
            "contractReference_2_object2",
            terms.contractReference_2.object2
        );
    }

    /**
     * @dev Decode and loads CECTerms
     */
    function decodeAndGetCECTerms(Asset storage asset) external view returns (CECTerms memory) {
        return CECTerms(
            ContractType(uint8(uint256(asset.packedTerms["enums"] >> 248))),
            Calendar(uint8(uint256(asset.packedTerms["enums"] >> 240))),
            ContractRole(uint8(uint256(asset.packedTerms["enums"] >> 232))),
            DayCountConvention(uint8(uint256(asset.packedTerms["enums"] >> 224))),
            BusinessDayConvention(uint8(uint256(asset.packedTerms["enums"] >> 216))),
            EndOfMonthConvention(uint8(uint256(asset.packedTerms["enums"] >> 208))),
            ContractPerformance(uint8(uint256(asset.packedTerms["enums"] >> 200))),
            FeeBasis(uint8(uint256(asset.packedTerms["enums"] >> 192))),

            uint256(asset.packedTerms["statusDate"]),
            uint256(asset.packedTerms["maturityDate"]),

            int256(asset.packedTerms["notionalPrincipal"]),
            int256(asset.packedTerms["feeRate"]),
            int256(asset.packedTerms["coverageOfCreditEnhancement"]),

            ContractReference(
                asset.packedTerms["contractReference_1_object"],
                asset.packedTerms["contractReference_1_object2"],
                ContractReferenceType(uint8(uint256(asset.packedTerms["contractReference_1_type_role"] >> 16))),
                ContractReferenceRole(uint8(uint256(asset.packedTerms["contractReference_1_type_role"] >> 8)))
            ),
            ContractReference(
                asset.packedTerms["contractReference_2_object"],
                asset.packedTerms["contractReference_2_object2"],
                ContractReferenceType(uint8(uint256(asset.packedTerms["contractReference_2_type_role"] >> 16))),
                ContractReferenceRole(uint8(uint256(asset.packedTerms["contractReference_2_type_role"] >> 8)))
            )
        );
    }

    function decodeAndGetEnumValueForCECTermsAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (uint8)
    {
        if (attributeKey == "contractType") {
            return uint8(uint256(asset.packedTerms["enums"] >> 248));
        } else if (attributeKey == bytes32("calendar")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 240));
        } else if (attributeKey == bytes32("contractRole")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 232));
        } else if (attributeKey == bytes32("dayCountConvention")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 224));
        } else if (attributeKey == bytes32("businessDayConvention")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 216));
        } else if (attributeKey == bytes32("endOfMonthConvention")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 208));
        } else if (attributeKey == bytes32("creditEventTypeCovered")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 200));
        } else if (attributeKey == bytes32("feeBasis")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 192));
        } else {
            return uint8(0);
        }
    }

    function decodeAndGetAddressValueForCECTermsAttribute(Asset storage /* asset */, bytes32 /* attributeKey */)
        external
        pure
        returns (address)
    {
        return address(0);
    }

    function decodeAndGetBytes32ValueForCECTermsAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (bytes32)
    {
        return asset.packedTerms[attributeKey];
    }

    function decodeAndGetUIntValueForCECTermsAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (uint256)
    {
        return uint256(asset.packedTerms[attributeKey]);
    }

    function decodeAndGetIntValueForCECTermsAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (int256)
    {
        return int256(asset.packedTerms[attributeKey]);
    }

    function decodeAndGetPeriodValueForCECTermsAttribute(Asset storage /* asset */, bytes32 /* attributeKey */)
        external
        pure
        returns (IP memory)
    {
        return IP(0, P(0), false);
    }

    function decodeAndGetCycleValueForCECTermsAttribute(Asset storage /* asset */, bytes32 /* attributeKey */)
        external
        pure
        returns (IPS memory)
    {
        return IPS(0, P(0), S(0), false);
    }

    function decodeAndGetContractReferenceValueForCECTermsAttribute(Asset storage asset , bytes32 attributeKey )
        external
        view
        returns (ContractReference memory)
    {
        if (attributeKey == bytes32("contractReference_1")) {
            return ContractReference(
                asset.packedTerms["contractReference_1_object"],
                asset.packedTerms["contractReference_1_object2"],
                ContractReferenceType(uint8(uint256(asset.packedTerms["contractReference_1_type_role"] >> 16))),
                ContractReferenceRole(uint8(uint256(asset.packedTerms["contractReference_1_type_role"] >> 8)))
            );
        } else if (attributeKey == bytes32("contractReference_2")) {
            return ContractReference(
                asset.packedTerms["contractReference_2_object"],
                asset.packedTerms["contractReference_2_object2"],
                ContractReferenceType(uint8(uint256(asset.packedTerms["contractReference_2_type_role"] >> 16))),
                ContractReferenceRole(uint8(uint256(asset.packedTerms["contractReference_2_type_role"] >> 8)))
            );
        } else {
            return ContractReference(
                bytes32(0),
                bytes32(0),
                ContractReferenceType(0),
                ContractReferenceRole(0)
            );
        }
    }

    /**
     * @dev Tightly pack and store CECState
     */
    function encodeAndSetCECState(Asset storage asset, CECState memory state) external {
        storeInPackedState(asset, "contractPerformance", bytes32(uint256(uint8(state.contractPerformance))) << 248);
        storeInPackedState(asset, "statusDate", bytes32(state.statusDate));
        storeInPackedState(asset, "maturityDate", bytes32(state.maturityDate));
        storeInPackedState(asset, "exerciseDate", bytes32(state.exerciseDate));
        storeInPackedState(asset, "terminationDate", bytes32(state.terminationDate));
        storeInPackedState(asset, "feeAccrued", bytes32(state.feeAccrued));
        storeInPackedState(asset, "exerciseAmount", bytes32(state.exerciseAmount));
    }

    /**
     * @dev Tightly pack and store finalized CECState
     */
    function encodeAndSetFinalizedCECState(Asset storage asset, CECState memory state) external {
        storeInPackedState(asset, "F_contractPerformance", bytes32(uint256(uint8(state.contractPerformance))) << 248);
        storeInPackedState(asset, "F_statusDate", bytes32(state.statusDate));
        storeInPackedState(asset, "F_maturityDate", bytes32(state.maturityDate));
        storeInPackedState(asset, "F_exerciseDate", bytes32(state.exerciseDate));
        storeInPackedState(asset, "F_terminationDate", bytes32(state.terminationDate));
        storeInPackedState(asset, "F_feeAccrued", bytes32(state.feeAccrued));
        storeInPackedState(asset, "F_exerciseAmount", bytes32(state.exerciseAmount));
    }

    /**
     * @dev Decode and load the CECState of the asset
     */
    function decodeAndGetCECState(Asset storage asset)
        external
        view
        returns (CECState memory)
    {
        return CECState(
            ContractPerformance(uint8(uint256(asset.packedState["contractPerformance"] >> 248))),
            uint256(asset.packedState["statusDate"]),
            uint256(asset.packedState["maturityDate"]),
            uint256(asset.packedState["exerciseDate"]),
            uint256(asset.packedState["terminationDate"]),
            int256(asset.packedState["feeAccrued"]),
            int256(asset.packedState["exerciseAmount"])
        );
    }

    /**
     * @dev Decode and load the finalized CECState of the asset
     */
    function decodeAndGetFinalizedCECState(Asset storage asset)
        external
        view
        returns (CECState memory)
    {
        return CECState(
            ContractPerformance(uint8(uint256(asset.packedState["F_contractPerformance"] >> 248))),
            uint256(asset.packedState["F_statusDate"]),
            uint256(asset.packedState["F_maturityDate"]),
            uint256(asset.packedState["F_exerciseDate"]),
            uint256(asset.packedState["F_terminationDate"]),
            int256(asset.packedState["F_feeAccrued"]),
            int256(asset.packedState["F_exerciseAmount"])
        );
    }

    function decodeAndGetEnumValueForCECStateAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (uint8)
    {
        if (attributeKey == bytes32("contractPerformance")) {
            return uint8(uint256(asset.packedState["contractPerformance"] >> 248));
        } else if (attributeKey == bytes32("F_contractPerformance")) {
            return uint8(uint256(asset.packedState["F_contractPerformance"] >> 248));
        } else {
            return uint8(0);
        }
    }

    function decodeAndGetUIntValueForCECStateAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (uint256)
    {
        return uint256(asset.packedState[attributeKey]);
    }

    function decodeAndGetIntValueForCECStateAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (int256)
    {
        return int256(asset.packedState[attributeKey]);
    }
}