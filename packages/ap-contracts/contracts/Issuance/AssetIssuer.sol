pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../Core/SharedTypes.sol";
import "../Core/Conversions.sol";
import "../Core/TemplateRegistry/ITemplateRegistry.sol";
import "../Core/AssetRegistry/IAssetRegistry.sol";
import "../Core/AssetActor/IAssetActor.sol";
import "./IAssetIssuer.sol";
import "./ICustodian.sol";
import "./VerifyOrder.sol";


/**
 * @title AssetIssuer
 * @notice Contract for issuing ACTUS assets. Currently supports the issuance of
 * independent assets as well as assets with up to two enhancements (such as Guarantee and Collateral).
 */
contract AssetIssuer is
    SharedTypes,
    Conversions,
    VerifyOrder,
    IAssetIssuer
{
    event ExecutedOrder(bytes32 indexed orderId, bytes32 assetId);

    event IssuedAsset(bytes32 indexed assetId, address indexed creator, address indexed counterparty);

    ICustodian public custodian;
    ITemplateRegistry public templateRegistry;
    IAssetRegistry public assetRegistry;


    constructor(ICustodian _custodian, ITemplateRegistry _templateRegistry, IAssetRegistry _assetRegistry) public {
        custodian = _custodian;
        templateRegistry = _templateRegistry;
        assetRegistry = _assetRegistry;
    }

    function issueFromDraft(Draft memory draft)
        public
    {
        (
            bytes32 assetId,
            AssetOwnership memory ownership,
            bytes32 templateId,
            CustomTerms memory customTerms,
            address engine,
            address actor
        ) = finalizeDraft(draft);

        issueAsset(
            assetId, ownership, templateId, customTerms, engine, actor
        );
    }

    function finalizeDraft(Draft memory draft)
        internal
        returns (bytes32, AssetOwnership memory, bytes32, CustomTerms memory, address, address)
    {
        bytes32 assetId = keccak256(abi.encode(draft.termsHash, block.timestamp));

        // check if first contract reference in terms references an underlying asset
        if (draft.customTerms.contractReference_1.contractReferenceRole == ContractReferenceRole.CVE) {
            require(
                draft.customTerms.contractReference_1.object != bytes32(0),
                "AssetIssuer.finalizeDraft: INVALID_OBJECT"
            );
        }

        // check if second contract reference in terms contains a reference to collateral
        if (draft.customTerms.contractReference_2.contractReferenceRole == ContractReferenceRole.CVI) {
            require(
                draft.customTerms.contractReference_2.object != bytes32(0),
                "AssetIssuer.finalizeDraft: INVALID_OBJECT"
            );

            // derive assetId and terms of draft from template terms and custom terms
            assetId = keccak256(abi.encode(draft.termsHash, address(custodian), block.timestamp));
            LifecycleTerms memory terms = deriveLifecycleTerms(
                templateRegistry.getTemplateTerms(draft.templateId),
                draft.customTerms
            );

            // derive underlying assetId
            bytes32 underlyingAssetId = draft.customTerms.contractReference_1.object;
            // get terms and ownership of referenced underlying asset
            LifecycleTerms memory underlyingTerms = assetRegistry.getTerms(underlyingAssetId);
            AssetOwnership memory underlyingOwnership = assetRegistry.getOwnership(underlyingAssetId);

            // set ownership of draft according to contract role of underlying
            if (terms.contractRole == ContractRole.BUY && underlyingTerms.contractRole == ContractRole.RPA) {
                draft.ownership = AssetOwnership(
                    underlyingOwnership.creatorObligor,
                    underlyingOwnership.creatorBeneficiary,
                    address(custodian),
                    underlyingOwnership.counterpartyBeneficiary
                );
            } else if (terms.contractRole == ContractRole.SEL && underlyingTerms.contractRole == ContractRole.RPL) {
                draft.ownership = AssetOwnership(
                    address(custodian),
                    underlyingOwnership.creatorBeneficiary,
                    underlyingOwnership.counterpartyObligor,
                    underlyingOwnership.counterpartyBeneficiary
                );
            } else {
                // only BUY, RPA and SEL, RPL allowed for CEC
                revert("AssetIssuer.finalizeDraft: INVALID_CONTRACT_ROLES");
            }

            // execute contractual conditions
            // try transferring collateral to the custodian
            custodian.lockCollateral(assetId, terms, draft.ownership);
        }

        return (
            assetId,
            draft.ownership,
            draft.templateId,
            draft.customTerms,
            draft.engine,
            draft.actor
        );
    }

    /**
     * @notice Issues an asset from an order which was signed by the creator obligor and the counterparty obligor.
     * @dev verifies both signatures and initializes by calling the specified asset actor,
     * If ownership is undefined and signatures are undefined it skips signature verification.
     * (required if a Collateral enhancement is present)
     * @param order order for which to issue the asset
     */
    function issueFromOrder(Order memory order)
        public
    {
        // verify signatures of order (and enhancement orders)
        require(
            assertOrderSignatures(order),
            "AssetIssuer.issueFromOrder: INVALID_SIGNATURE"
        );

        // issue asset (underlying)
        (
            bytes32 assetId,
            AssetOwnership memory ownership,
            bytes32 templateId,
            CustomTerms memory customTerms,
            address engine,
            address actor
        ) = finalizeOrder(order);

        issueAsset(
            assetId, ownership, templateId, customTerms, engine, actor
        );

        // check if first enhancement order is specified
        if (order.enhancementOrder_1.termsHash != bytes32(0)) {
            (
                bytes32 assetId,
                AssetOwnership memory ownership,
                bytes32 templateId,
                CustomTerms memory customTerms,
                address engine,
                address actor
            ) = finalizeEnhancementOrder(order.enhancementOrder_1, order);

            issueAsset(
                assetId, ownership, templateId, customTerms, engine, actor
            );
        }

        // check if second enhancement order is specified
        if (order.enhancementOrder_2.termsHash != bytes32(0)) {
            (
                bytes32 assetId,
                AssetOwnership memory ownership,
                bytes32 templateId,
                CustomTerms memory customTerms,
                address engine,
                address actor
            ) = finalizeEnhancementOrder(order.enhancementOrder_2, order);

            issueAsset(
                assetId, ownership, templateId, customTerms, engine, actor
            );
        }

        emit ExecutedOrder(keccak256(abi.encode(order.creatorSignature)), assetId);
    }

    /**
     * @notice Executes all pre-issuance conditions (e.g. collateral requirements)
     * defined in the contract references of the order and sets the final ownership of the asset
     */
    function finalizeOrder(Order memory order)
        internal
        returns (bytes32, AssetOwnership memory, bytes32, CustomTerms memory, address, address)
    {
        bytes32 assetId = keccak256(abi.encode(order.creatorSignature, order.counterpartySignature));

        // check if first contract reference in terms references an underlying asset
        if (order.customTerms.contractReference_1.contractReferenceRole == ContractReferenceRole.CVE) {
            require(
                order.customTerms.contractReference_1.object != bytes32(0),
                "AssetIssuer.finalizeOrder: INVALID_OBJECT"
            );
        }

        // check if second contract reference in terms contains a reference to collateral
        if (order.customTerms.contractReference_2.contractReferenceRole == ContractReferenceRole.CVI) {
            require(
                order.customTerms.contractReference_2.object != bytes32(0),
                "AssetIssuer.finalizeOrder: INVALID_OBJECT"
            );

            // derive assetId and terms of order from template terms and custom terms
            assetId = keccak256(abi.encode(order.termsHash, address(custodian), order.salt));
            LifecycleTerms memory terms = deriveLifecycleTerms(
                templateRegistry.getTemplateTerms(order.templateId),
                order.customTerms
            );

            // derive underlying assetId
            bytes32 underlyingAssetId = order.customTerms.contractReference_1.object;
            // get terms and ownership of referenced underlying asset
            LifecycleTerms memory underlyingTerms = assetRegistry.getTerms(underlyingAssetId);
            AssetOwnership memory underlyingOwnership = assetRegistry.getOwnership(underlyingAssetId);

            // set ownership of order according to contract role of underlying
            if (terms.contractRole == ContractRole.BUY && underlyingTerms.contractRole == ContractRole.RPA) {
                order.ownership = AssetOwnership(
                    underlyingOwnership.creatorObligor,
                    underlyingOwnership.creatorBeneficiary,
                    address(custodian),
                    underlyingOwnership.counterpartyBeneficiary
                );
            } else if (terms.contractRole == ContractRole.SEL && underlyingTerms.contractRole == ContractRole.RPL) {
                order.ownership = AssetOwnership(
                    address(custodian),
                    underlyingOwnership.creatorBeneficiary,
                    underlyingOwnership.counterpartyObligor,
                    underlyingOwnership.counterpartyBeneficiary
                );
            } else {
                // only BUY, RPA and SEL, RPL allowed for CEC
                revert("AssetIssuer.finalizeOrder: INVALID_CONTRACT_ROLES");
            }

            // execute contractual conditions
            // try transferring collateral to the custodian
            custodian.lockCollateral(assetId, terms, order.ownership);
        }

        return (
            assetId,
            order.ownership,
            order.templateId,
            order.customTerms,
            order.engine,
            order.actor
        );
    }

    /**
     * @notice Executes all pre-issuance conditions (e.g. collateral requirements)
     * defined in the contract references of the enhancement order and sets the final ownership of the enhancement
     */
    function finalizeEnhancementOrder(EnhancementOrder memory enhancementOrder, Order memory order)
        internal
        returns (bytes32, AssetOwnership memory, bytes32, CustomTerms memory, address, address)
    {
        bytes32 assetId = keccak256(abi.encode(enhancementOrder.creatorSignature, enhancementOrder.counterpartySignature));

        // check if first contract reference in enhancement terms references an underlying asset
        if (enhancementOrder.customTerms.contractReference_1.contractReferenceRole == ContractReferenceRole.CVE) {
            // derive assetId of underlying and set as object in the first contract reference
            enhancementOrder.customTerms.contractReference_1.object = keccak256(
                abi.encode(order.creatorSignature, order.counterpartySignature)
            );
        }

        // check if second contract reference in enhancement terms contain a reference to collateral
        if (enhancementOrder.customTerms.contractReference_2.contractReferenceRole == ContractReferenceRole.CVI) {
            // derive assetId
            assetId = keccak256(abi.encode(order.creatorSignature, order.counterpartySignature, address(custodian)));

            // derive terms of underlying from template terms and custom terms
            LifecycleTerms memory underlyingTerms = deriveLifecycleTerms(
                templateRegistry.getTemplateTerms(order.templateId),
                order.customTerms
            );
            // derive terms of enhancement from template terms and custom terms
            LifecycleTerms memory enhancementTerms = deriveLifecycleTerms(
                templateRegistry.getTemplateTerms(enhancementOrder.templateId),
                enhancementOrder.customTerms
            );

            // set ownership of enhancement according to contract role of underlying
            if (enhancementTerms.contractRole == ContractRole.BUY && underlyingTerms.contractRole == ContractRole.RPA) {
                enhancementOrder.ownership = AssetOwnership(
                    order.ownership.creatorObligor,
                    order.ownership.creatorBeneficiary,
                    address(custodian),
                    order.ownership.counterpartyBeneficiary
                );
            } else if (enhancementTerms.contractRole == ContractRole.SEL && underlyingTerms.contractRole == ContractRole.RPL) {
                enhancementOrder.ownership = AssetOwnership(
                    address(custodian),
                    order.ownership.creatorBeneficiary,
                    order.ownership.counterpartyObligor,
                    order.ownership.counterpartyBeneficiary
                );
            } else {
                // only BUY, RPA and SEL, RPL allowed for CEC
                revert("AssetIssuer.finalizeEnhancementOrder: INVALID_CONTRACT_ROLES");
            }

            // execute contractual conditions
            require(
                enhancementTerms.contractReference_2.object != bytes32(0),
                "AssetIssuer.finalizeEnhancementOrder: INVALID_OBJECT"
            );
            // try transferring collateral to the custodian
            custodian.lockCollateral(assetId, enhancementTerms, enhancementOrder.ownership);
        }

        return (
            assetId,
            enhancementOrder.ownership,
            enhancementOrder.templateId,
            enhancementOrder.customTerms,
            enhancementOrder.engine,
            order.actor
        );
    }

    function issueAsset(
        bytes32 assetId,
        AssetOwnership memory ownership,
        bytes32 templateId,
        CustomTerms memory customTerms,
        address engine,
        address actor
    )
        internal
    {
        // initialize the asset by calling the asset actor
        require(
            IAssetActor(actor).initialize(
                assetId,
                ownership,
                templateId,
                customTerms,
                engine
            ),
            "AssetIssuer.issueAsset: EXECUTION_ERROR"
        );

        emit IssuedAsset(assetId, ownership.creatorObligor, ownership.counterpartyObligor);
    }
}
