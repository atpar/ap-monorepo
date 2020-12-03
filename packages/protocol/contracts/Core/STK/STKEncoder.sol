// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../Base/SharedTypes.sol";
import "../Base/AssetRegistry/BaseRegistryStorage.sol";


library STKEncoder {

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
    function encodeAndSetSTKTerms(Asset storage asset, STKTerms memory terms) external {
        storeInPackedTerms(
            asset,
            "enums",
            bytes32(uint256(uint8(terms.contractType))) << 248 |
            bytes32(uint256(uint8(terms.calendar))) << 240 |
            bytes32(uint256(uint8(terms.contractRole))) << 232 |
            bytes32(uint256(uint8(terms.dayCountConvention))) << 224 |
            bytes32(uint256(uint8(terms.businessDayConvention))) << 216 |
            bytes32(uint256(uint8(terms.endOfMonthConvention))) << 208 |
            bytes32(uint256(uint8(terms.redeemableByIssuer))) << 200
        );

        storeInPackedTerms(asset, "currency", bytes32(uint256(terms.currency) << 96));
        storeInPackedTerms(asset, "settlementCurrency", bytes32(uint256(terms.settlementCurrency) << 96));

        storeInPackedTerms(asset, "statusDate", bytes32(terms.statusDate));
        storeInPackedTerms(asset, "issueDate", bytes32(terms.issueDate));
        storeInPackedTerms(asset, "purchaseDate", bytes32(terms.purchaseDate));
        storeInPackedTerms(asset, "cycleAnchorDateOfDividend", bytes32(terms.cycleAnchorDateOfDividend));

        storeInPackedTerms(asset, "nominalPrice", bytes32(terms.nominalPrice));
        storeInPackedTerms(asset, "notionalPrincipal", bytes32(terms.notionalPrincipal));
        storeInPackedTerms(asset, "issuePrice", bytes32(terms.issuePrice));
        storeInPackedTerms(asset, "quantity", bytes32(terms.quantity));
        storeInPackedTerms(asset, "priceAtPurchaseDate", bytes32(terms.priceAtPurchaseDate));
        storeInPackedTerms(asset, "priceAtTerminationDate", bytes32(terms.priceAtTerminationDate));
        storeInPackedTerms(asset, "redemptionPrice", bytes32(terms.redemptionPrice));

        storeInPackedTerms(
            asset,
            "dividendRecordPeriod",
            bytes32(uint256(terms.dividendRecordPeriod.i)) << 24 |
            bytes32(uint256(terms.dividendRecordPeriod.p)) << 16 |
            bytes32(uint256((terms.dividendRecordPeriod.isSet) ? 1 : 0)) << 8
        );
        storeInPackedTerms(
            asset,
            "dividendPaymentPeriod",
            bytes32(uint256(terms.dividendPaymentPeriod.i)) << 24 |
            bytes32(uint256(terms.dividendPaymentPeriod.p)) << 16 |
            bytes32(uint256((terms.dividendPaymentPeriod.isSet) ? 1 : 0)) << 8
        );
        storeInPackedTerms(
            asset,
            "splitSettlementPeriod",
            bytes32(uint256(terms.splitSettlementPeriod.i)) << 24 |
            bytes32(uint256(terms.splitSettlementPeriod.p)) << 16 |
            bytes32(uint256((terms.splitSettlementPeriod.isSet) ? 1 : 0)) << 8
        );
        storeInPackedTerms(
            asset,
            "redemptionRecordPeriod",
            bytes32(uint256(terms.redemptionRecordPeriod.i)) << 24 |
            bytes32(uint256(terms.redemptionRecordPeriod.p)) << 16 |
            bytes32(uint256((terms.redemptionRecordPeriod.isSet) ? 1 : 0)) << 8
        );
        storeInPackedTerms(
            asset,
            "redemptionPaymentPeriod",
            bytes32(uint256(terms.redemptionPaymentPeriod.i)) << 24 |
            bytes32(uint256(terms.redemptionPaymentPeriod.p)) << 16 |
            bytes32(uint256((terms.redemptionPaymentPeriod.isSet) ? 1 : 0)) << 8
        );
        storeInPackedTerms(
            asset,
            "cycleOfDividend",
            bytes32(uint256(terms.cycleOfDividend.i)) << 24 |
            bytes32(uint256(terms.cycleOfDividend.p)) << 16 |
            bytes32(uint256(terms.cycleOfDividend.s)) << 8 |
            bytes32(uint256((terms.cycleOfDividend.isSet) ? 1 : 0))
        );
    }

    /**
     * @dev Decode and loads STKTerms
     */
    function decodeAndGetSTKTerms(Asset storage asset) external view returns (STKTerms memory) {
        return STKTerms(
            ContractType(uint8(uint256(asset.packedTerms["enums"] >> 248))),
            Calendar(uint8(uint256(asset.packedTerms["enums"] >> 240))),
            ContractRole(uint8(uint256(asset.packedTerms["enums"] >> 232))),
            DayCountConvention(uint8(uint256(asset.packedTerms["enums"] >> 224))),
            BusinessDayConvention(uint8(uint256(asset.packedTerms["enums"] >> 216))),
            EndOfMonthConvention(uint8(uint256(asset.packedTerms["enums"] >> 208))),
            RedeemableByIssuer(uint8(uint256(asset.packedTerms["enums"] >> 200))),

            address(uint160(uint256(asset.packedTerms["currency"]) >> 96)),
            address(uint160(uint256(asset.packedTerms["settlementCurrency"]) >> 96)),

            uint256(asset.packedTerms["statusDate"]),
            uint256(asset.packedTerms["issueDate"]),
            uint256(asset.packedTerms["purchaseDate"]),
            uint256(asset.packedTerms["cycleAnchorDateOfDividend"]),

            int256(asset.packedTerms["nominalPrice"]),
            int256(asset.packedTerms["notionalPrincipal"]),
            int256(asset.packedTerms["issuePrice"]),
            int256(asset.packedTerms["quantity"]),
            int256(asset.packedTerms["priceAtPurchaseDate"]),
            int256(asset.packedTerms["priceAtTerminationDate"]),
            int256(asset.packedTerms["redemptionPrice"]),

            IP(
                uint256(asset.packedTerms["dividendRecordPeriod"] >> 24),
                P(uint8(uint256(asset.packedTerms["dividendRecordPeriod"] >> 16))),
                (asset.packedTerms["dividendRecordPeriod"] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),
            IP(
                uint256(asset.packedTerms["dividendPaymentPeriod"] >> 24),
                P(uint8(uint256(asset.packedTerms["dividendPaymentPeriod"] >> 16))),
                (asset.packedTerms["dividendPaymentPeriod"] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),
            IP(
                uint256(asset.packedTerms["splitSettlementPeriod"] >> 24),
                P(uint8(uint256(asset.packedTerms["splitSettlementPeriod"] >> 16))),
                (asset.packedTerms["splitSettlementPeriod"] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),
            IP(
                uint256(asset.packedTerms["redemptionRecordPeriod"] >> 24),
                P(uint8(uint256(asset.packedTerms["redemptionRecordPeriod"] >> 16))),
                (asset.packedTerms["redemptionRecordPeriod"] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),
            IP(
                uint256(asset.packedTerms["redemptionPaymentPeriod"] >> 24),
                P(uint8(uint256(asset.packedTerms["redemptionPaymentPeriod"] >> 16))),
                (asset.packedTerms["redemptionPaymentPeriod"] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),
            IPS(
                uint256(asset.packedTerms["cycleOfDividend"] >> 24),
                P(uint8(uint256(asset.packedTerms["cycleOfDividend"] >> 16))),
                S(uint8(uint256(asset.packedTerms["cycleOfDividend"] >> 8))),
                (asset.packedTerms["cycleOfDividend"] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            )
        );
    }

    function decodeAndGetEnumValueForSTKAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (uint8)
    {
        if (attributeKey == bytes32("contractType")) {
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
        } else if (attributeKey == bytes32("redeemableByIssuer")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 200));
        } else {
            return uint8(0);
        }
    }

    function decodeAndGetAddressValueForForSTKAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (address)
    {
        if (attributeKey == bytes32("currency")) {
            return address(uint160(uint256(asset.packedTerms["currency"]) >> 96));
        } else if (attributeKey == bytes32("settlementCurrency")) {
            return address(uint160(uint256(asset.packedTerms["settlementCurrency"]) >> 96));
        } else {
            return address(0);
        }
    }

    function decodeAndGetBytes32ValueForForSTKAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (bytes32)
    {
        return asset.packedTerms[attributeKey];
    }

    function decodeAndGetUIntValueForForSTKAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (uint256)
    {
        return uint256(asset.packedTerms[attributeKey]);
    }

    function decodeAndGetIntValueForForSTKAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (int256)
    {
        return int256(asset.packedTerms[attributeKey]);
    }

    function decodeAndGetPeriodValueForForSTKAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (IP memory)
    {
        if (
            attributeKey == bytes32("dividendRecordPeriod")
            || attributeKey == bytes32("dividendPaymentPeriod")
            || attributeKey == bytes32("splitSettlementPeriod")
            || attributeKey == bytes32("redemptionRecordPeriod")
            || attributeKey == bytes32("redemptionPaymentPeriod")
        ) {
            return IP(
                uint256(asset.packedTerms[attributeKey] >> 24),
                P(uint8(uint256(asset.packedTerms[attributeKey] >> 16))),
                (asset.packedTerms[attributeKey] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            );
        } else {
            return IP(0, P(0), false);
        }
    }

    function decodeAndGetCycleValueForForSTKAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (IPS memory)
    {
        if ( attributeKey == bytes32("cycleOfDividend") ) {
            return IPS(
                uint256(asset.packedTerms[attributeKey] >> 24),
                P(uint8(uint256(asset.packedTerms[attributeKey] >> 16))),
                S(uint8(uint256(asset.packedTerms[attributeKey] >> 8))),
                (asset.packedTerms[attributeKey] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            );
        } else {
            return IPS(0, P(0), S(0), false);
        }
    }

    /**
     * @dev Tightly pack and store STKState
     */
    function encodeAndSetSTKState(Asset storage asset, STKState memory state) external {
        storeInPackedState(asset, "contractPerformance", bytes32(uint256(uint8(state.contractPerformance))) << 248);
        storeInPackedState(asset, "statusDate", bytes32(state.statusDate));
        storeInPackedState(asset, "nonPerformingDate", bytes32(state.nonPerformingDate));
        storeInPackedState(asset, "maturityDate", bytes32(state.maturityDate));
        storeInPackedState(asset, "exerciseDate", bytes32(state.exerciseDate));
        storeInPackedState(asset, "terminationDate", bytes32(state.terminationDate));
        storeInPackedState(asset, "lastDividendFixingDate", bytes32(state.lastDividendFixingDate));
        storeInPackedState(asset, "notionalPrincipal", bytes32(state.notionalPrincipal));
        storeInPackedState(asset, "exerciseAmount", bytes32(state.exerciseAmount));
        storeInPackedState(asset, "exerciseQuantity", bytes32(state.exerciseQuantity));
        storeInPackedState(asset, "quantity", bytes32(state.quantity));
        storeInPackedState(asset, "couponAmountFixed", bytes32(state.couponAmountFixed));
        storeInPackedState(asset, "marginFactor", bytes32(state.marginFactor));
        storeInPackedState(asset, "adjustmentFactor", bytes32(state.adjustmentFactor));
        storeInPackedState(asset, "dividendPaymentAmount", bytes32(state.dividendPaymentAmount));
        storeInPackedState(asset, "splitRatio", bytes32(state.splitRatio));
    }

    /**
     * @dev Tightly pack and store finalized STKState
     */
    function encodeAndSetFinalizedSTKState(Asset storage asset, STKState memory state) external {
        storeInPackedState(asset, "F_contractPerformance", bytes32(uint256(uint8(state.contractPerformance))) << 248);
        storeInPackedState(asset, "F_statusDate", bytes32(state.statusDate));
        storeInPackedState(asset, "F_nonPerformingDate", bytes32(state.nonPerformingDate));
        storeInPackedState(asset, "F_maturityDate", bytes32(state.maturityDate));
        storeInPackedState(asset, "F_exerciseDate", bytes32(state.exerciseDate));
        storeInPackedState(asset, "F_terminationDate", bytes32(state.terminationDate));
        storeInPackedState(asset, "F_lastDividendFixingDate", bytes32(state.lastDividendFixingDate));
        storeInPackedState(asset, "F_notionalPrincipal", bytes32(state.notionalPrincipal));
        storeInPackedState(asset, "F_exerciseAmount", bytes32(state.exerciseAmount));
        storeInPackedState(asset, "F_exerciseQuantity", bytes32(state.exerciseQuantity));
        storeInPackedState(asset, "F_quantity", bytes32(state.quantity));
        storeInPackedState(asset, "F_couponAmountFixed", bytes32(state.couponAmountFixed));
        storeInPackedState(asset, "F_marginFactor", bytes32(state.marginFactor));
        storeInPackedState(asset, "F_adjustmentFactor", bytes32(state.adjustmentFactor));
        storeInPackedState(asset, "F_dividendPaymentAmount", bytes32(state.dividendPaymentAmount));
        storeInPackedState(asset, "F_splitRatio", bytes32(state.splitRatio));
    }

    /**
     * @dev Decode and load the STKState of the asset
     */
    function decodeAndGetSTKState(Asset storage asset)
        external
        view
        returns (STKState memory)
    {
        return STKState(
            ContractPerformance(uint8(uint256(asset.packedState["contractPerformance"] >> 248))),
            uint256(asset.packedState["statusDate"]),
            uint256(asset.packedState["nonPerformingDate"]),
            uint256(asset.packedState["maturityDate"]),
            uint256(asset.packedState["exerciseDate"]),
            uint256(asset.packedState["terminationDate"]),
            uint256(asset.packedState["lastDividendFixingDate"]),
            int256(asset.packedState["notionalPrincipal"]),
            int256(asset.packedState["exerciseAmomunt"]),
            int256(asset.packedState["exerciseQuantity"]),
            int256(asset.packedState["quantity"]),
            int256(asset.packedState["couponAmountFixed"]),
            int256(asset.packedState["marginFactor"]),
            int256(asset.packedState["adjustmentFactor"]),
            int256(asset.packedState["dividendPaymentAmount"]),
            int256(asset.packedState["splitRatio"])
        );
    }

    /**
     * @dev Decode and load the finalized STKState of the asset
     */
    function decodeAndGetFinalizedSTKState(Asset storage asset)
        external
        view
        returns (STKState memory)
    {
        return STKState(
            ContractPerformance(uint8(uint256(asset.packedState["F_contractPerformance"] >> 248))),
            uint256(asset.packedState["F_statusDate"]),
            uint256(asset.packedState["F_nonPerformingDate"]),
            uint256(asset.packedState["F_maturityDate"]),
            uint256(asset.packedState["F_exerciseDate"]),
            uint256(asset.packedState["F_terminationDate"]),
            uint256(asset.packedState["F_lastDividendFixingDate"]),
            int256(asset.packedState["F_notionalPrincipal"]),
            int256(asset.packedState["F_exerciseAmomunt"]),
            int256(asset.packedState["F_exerciseQuantity"]),
            int256(asset.packedState["F_quantity"]),
            int256(asset.packedState["F_couponAmountFixed"]),
            int256(asset.packedState["F_marginFactor"]),
            int256(asset.packedState["F_adjustmentFactor"]),
            int256(asset.packedState["F_dividendPaymentAmount"]),
            int256(asset.packedState["F_splitRatio"])
        );
    }

    function decodeAndGetEnumValueForSTKStateAttribute(Asset storage asset, bytes32 attributeKey)
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

    function decodeAndGetUIntValueForSTKStateAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (uint256)
    {
        return uint256(asset.packedState[attributeKey]);
    }

    function decodeAndGetIntValueForSTKStateAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (int256)
    {
        return int256(asset.packedState[attributeKey]);
    }
}
