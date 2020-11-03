// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../../SharedTypes.sol";
import "../../Lib.sol";

import "../BaseFacet.sol";
import "../AccessControl/IAccessControlFacet.sol";
import "./IOwnershipFacet.sol";


/**
 * @title OwnershipFacet
 */
contract OwnershipFacet is BaseFacet, IOwnershipFacet {

    event UpdatedObligor (bytes32 assetId, address prevObligor, address newObligor);
    event UpdatedBeneficiary(bytes32 assetId, address prevBeneficiary, address newBeneficiary);


    /**
     * @notice Update the address of the default beneficiary of cashflows going to the creator.
     * @dev Can only be updated by the current creator beneficiary or by an authorized account.
     * @param assetId id of the asset
     * @param newCreatorBeneficiary address of the new beneficiary
     */
    function setCreatorBeneficiary(
        bytes32 assetId,
        address newCreatorBeneficiary
    )
        external
        override
    {
        address prevCreatorBeneficiary = assetStorage().assets[assetId].ownership.creatorBeneficiary;

        require(
            prevCreatorBeneficiary != address(0),
            "AssetRegistry.setCreatorBeneficiary: ENTRY_DOES_NOT_EXIST"
        );
        require(
            msg.sender == prevCreatorBeneficiary || IAccessControlFacet(address(this)).hasAccess(assetId, msg.sig, msg.sender),
            "AssetRegistry.setCreatorBeneficiary: UNAUTHORIZED_SENDER"
        );

        assetStorage().assets[assetId].ownership.creatorBeneficiary = newCreatorBeneficiary;

        emit UpdatedBeneficiary(assetId, prevCreatorBeneficiary, newCreatorBeneficiary);
    }

    /**
     * @notice Updates the address of the default beneficiary of cashflows going to the counterparty.
     * @dev Can only be updated by the current counterparty beneficiary or by an authorized account.
     * @param assetId id of the asset
     * @param newCounterpartyBeneficiary address of the new beneficiary
     */
    function setCounterpartyBeneficiary(
        bytes32 assetId,
        address newCounterpartyBeneficiary
    )
        external
        override
    {
        address prevCounterpartyBeneficiary = assetStorage().assets[assetId].ownership.counterpartyBeneficiary;

        require(
            prevCounterpartyBeneficiary != address(0),
            "AssetRegistry.setCounterpartyBeneficiary: ENTRY_DOES_NOT_EXIST"
        );
        require(
            msg.sender == prevCounterpartyBeneficiary || IAccessControlFacet(address(this)).hasAccess(assetId, msg.sig, msg.sender),
            "AssetRegistry.setCounterpartyBeneficiary: UNAUTHORIZED_SENDER"
        );

        assetStorage().assets[assetId].ownership.counterpartyBeneficiary = newCounterpartyBeneficiary;

        emit UpdatedBeneficiary(assetId, prevCounterpartyBeneficiary, newCounterpartyBeneficiary);
    }

    /**
     * @notice Update the address of the obligor which has to fulfill obligations
     * for the creator of the asset.
     * @dev Can only be updated by an authorized account.
     * @param assetId id of the asset
     * @param newCreatorObligor address of the new creator obligor
     */
    function setCreatorObligor (bytes32 assetId, address newCreatorObligor)
        external
        override
    {
        require(
            IAccessControlFacet(address(this)).hasAccess(assetId, msg.sig, msg.sender),
            "AssetRegistry.setCreatorObligor: UNAUTHORIZED_SENDER"
        );

        address prevCreatorObligor = assetStorage().assets[assetId].ownership.creatorObligor;

        assetStorage().assets[assetId].ownership.creatorObligor = newCreatorObligor;

        emit UpdatedObligor(assetId, prevCreatorObligor, newCreatorObligor);
    }

    /**
     * @notice Update the address of the counterparty which has to fulfill obligations
     * for the counterparty of the asset.
     * @dev Can only be updated by an authorized account.
     * @param assetId id of the asset
     * @param newCounterpartyObligor address of the new counterparty obligor
     */
    function setCounterpartyObligor (bytes32 assetId, address newCounterpartyObligor)
        external
        override
    {
        require(
            IAccessControlFacet(address(this)).hasAccess(assetId, msg.sig, msg.sender),
            "AssetRegistry.setCounterpartyObligor: UNAUTHORIZED_SENDER"
        );

        address prevCounterpartyObligor = assetStorage().assets[assetId].ownership.counterpartyObligor;

        assetStorage().assets[assetId].ownership.counterpartyObligor = newCounterpartyObligor;

        emit UpdatedObligor(assetId, prevCounterpartyObligor, newCounterpartyObligor);
    }

    /**
     * @notice Retrieves the registered addresses of owners (creator, counterparty) of an asset.
     * @param assetId id of the asset
     * @return addresses of all owners of the asset
     */
    function getOwnership(bytes32 assetId)
        external
        view
        override
        returns (AssetOwnership memory)
    {
        return assetStorage().assets[assetId].ownership;
    }
}
