pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../Core/SharedTypes.sol";
import "../Core/Conversions.sol";
import "../Core/AssetRegistry/IAssetRegistry.sol";
import "../Core/AssetActor/IAssetActor.sol";
import "./IAssetIssuer.sol";
import "./ICustodian.sol";


/**
 * @title AssetIssuer
 * @notice Contract for issuing ACTUS assets. Currently supports the issuance of
 * independent assets as well as assets with up to two enhancements (such as Guarantee and Collateral).
 */
contract AssetIssuer is
    SharedTypes,
    Conversions,
    IAssetIssuer
{
    event IssuedAsset(bytes32 indexed assetId, address indexed creator, address indexed counterparty);

    ICustodian public custodian;
    IAssetRegistry public assetRegistry;
    IAssetActor public assetActor;


    constructor(
        ICustodian _custodian,
        IAssetRegistry _assetRegistry,
        IAssetActor _assetActor
    )
        public
    {
        custodian = _custodian;
        assetRegistry = _assetRegistry;
        assetActor = _assetActor;
    }

    // function issueAsset(
    //     bytes32 termsHash,
    //     ANNTerms calldata terms,
    //     bytes32[] calldata schedule,
    //     AssetOwnership calldata ownership,
    //     address engine,
    //     address admin
    // )
    //     external
    //     override
    // {
    //     // solium-disable-next-line
    //     bytes32 assetId = keccak256(abi.encode(termsHash, block.timestamp));

    //     // initialize the asset by calling the asset actor
    //     require(
    //         assetActor.initialize(
    //             assetId,
    //             terms,
    //             schedule,
    //             ownership,
    //             engine,
    //             admin
    //         ),
    //         "AssetIssuer.issuePAM: INITIALIZATION_ERROR"
    //     );

    //     emit IssuedAsset(assetId, ownership.creatorObligor, ownership.counterpartyObligor);
    // }

    // function issueAsset(
    //     bytes32 termsHash,
    //     CECTerms calldata terms,
    //     bytes32[] calldata schedule,
    //     AssetOwnership calldata ownership,
    //     address engine,
    //     address admin
    // )
    //     external
    //     override
    // {
    //     // solium-disable-next-line
    //     bytes32 assetId = keccak256(abi.encode(termsHash, block.timestamp));

    //     // check if first contract reference in terms references an underlying asset
    //     if (terms.contractReference_1.role == ContractReferenceRole.COVE) {
    //         require(
    //             terms.contractReference_1.object != bytes32(0),
    //             "AssetIssuer.issueAsset: INVALID_OBJECT"
    //         );
    //     }

    //     // check if second contract reference in terms contains a reference to collateral
    //     if (terms.contractReference_2.role == ContractReferenceRole.COVI) {
    //         require(
    //             terms.contractReference_2.object != bytes32(0),
    //             "AssetIssuer.issueAsset: INVALID_OBJECT"
    //         );

    //         // derive assetId
    //         // solium-disable-next-line
    //         assetId = keccak256(abi.encode(termsHash, address(custodian), block.timestamp));

    //         // derive underlying assetId
    //         bytes32 underlyingAssetId = terms.contractReference_1.object;
    //         // get contract role and ownership of referenced underlying asset
    //         ContractRole underlyingContractRole = assetRegistry.getEnumValueFromTermsAttribute(underlyingAssetId, "contractRole");
    //         AssetOwnership memory underlyingAssetOwnership = assetRegistry.getAssetOwnership(underlyingAssetId);

    //         // set ownership of draft according to contract role of underlying
    //         if (terms.contractRole == ContractRole.BUY && underlyingContractRole == ContractRole.RPA) {
    //             ownership = AssetOwnership(
    //                 underlyingAssetOwnership.creatorObligor,
    //                 underlyingAssetOwnership.creatorBeneficiary,
    //                 address(custodian),
    //                 underlyingAssetOwnership.counterpartyBeneficiary
    //             );
    //         } else if (terms.contractRole == ContractRole.SEL && underlyingContractRole == ContractRole.RPL) {
    //             ownership = AssetOwnership(
    //                 address(custodian),
    //                 underlyingAssetOwnership.creatorBeneficiary,
    //                 underlyingAssetOwnership.counterpartyObligor,
    //                 underlyingAssetOwnership.counterpartyBeneficiary
    //             );
    //         } else {
    //             // only BUY, RPA and SEL, RPL allowed for CEC
    //             revert("AssetIssuer.issueAsset: INVALID_CONTRACT_ROLES");
    //         }

    //         // execute contractual conditions
    //         // try transferring collateral to the custodian
    //         custodian.lockCollateral(assetId, terms, ownership);
    //     }

    //     // initialize the asset by calling the asset actor
    //     require(
    //         assetActor.initialize(
    //             assetId,
    //             terms,
    //             schedule,
    //             ownership,
    //             engine,
    //             admin
    //         ),
    //         "AssetIssuer.issueAsset: INITIALIZATION_ERROR"
    //     );

    //     emit IssuedAsset(assetId, ownership.creatorObligor, ownership.counterpartyObligor);
    // }

    // function issueAsset(
    //     bytes32 termsHash,
    //     CEGTerms calldata terms,
    //     bytes32[] calldata schedule,
    //     AssetOwnership calldata ownership,
    //     address engine,
    //     address admin
    // )
    //     external
    //     override
    // {
    //     // solium-disable-next-line
    //     bytes32 assetId = keccak256(abi.encode(termsHash, block.timestamp));

    //     // check if first contract reference in terms references an underlying asset
    //     if (terms.contractReference_1.role == ContractReferenceRole.COVE) {
    //         require(
    //             terms.contractReference_1.object != bytes32(0),
    //             "AssetIssuer.issueAsset: INVALID_OBJECT"
    //         );
    //     }

    //     // todo add guarantee validation logic for contract reference 2

    //     // initialize the asset by calling the asset actor
    //     require(
    //         assetActor.initialize(
    //             assetId,
    //             terms,
    //             schedule,
    //             ownership,
    //             engine,
    //             admin
    //         ),
    //         "AssetIssuer.issueAsset: INITIALIZATION_ERROR"
    //     );

    //     emit IssuedAsset(assetId, ownership.creatorObligor, ownership.counterpartyObligor);
    // }

    function issueAsset(
        bytes32 termsHash,
        PAMTerms calldata terms,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address admin
    )
        external
        override
    {
        // solium-disable-next-line
        bytes32 assetId = keccak256(abi.encode(termsHash, block.timestamp));

        // initialize the asset by calling the asset actor
        require(
            assetActor.initialize(
                assetId,
                terms,
                schedule,
                ownership,
                engine,
                admin
            ),
            "AssetIssuer.issuePAM: INITIALIZATION_ERROR"
        );

        emit IssuedAsset(assetId, ownership.creatorObligor, ownership.counterpartyObligor);
    }
}
