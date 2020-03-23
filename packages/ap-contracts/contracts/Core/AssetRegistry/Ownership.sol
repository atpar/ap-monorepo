pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./AssetRegistryStorage.sol";
import "./AccessControl.sol";


/**
 * @title Ownership
 */
contract Ownership is AssetRegistryStorage, AccessControl {

    event UpdatedObligor (bytes32 assetId, address prevObligor, address newObligor);
    event UpdatedBeneficiary(bytes32 assetId, address prevBeneficiary, address newBeneficiary);
    event UpdatedCashflowBeneficiary(bytes32 assetId, int8 cashflowId, address prevBeneficiary, address newBeneficiary);


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
    {
        address prevCreatorBeneficiary = assets[assetId].ownership.creatorBeneficiary;

        require(
            prevCreatorBeneficiary != address(0),
            "AssetRegistry.setCreatorBeneficiary: ENTRY_DOES_NOT_EXIST"
        );
        require(
            msg.sender == prevCreatorBeneficiary || checkAccess(assetId, msg.sig, msg.sender),
            "AssetRegistry.setCreatorBeneficiary: UNAUTHORIZED_SENDER"
        );

        assets[assetId].ownership.creatorBeneficiary = newCreatorBeneficiary;

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
    {
        address prevCounterpartyBeneficiary = assets[assetId].ownership.counterpartyBeneficiary;

        require(
            prevCounterpartyBeneficiary != address(0),
            "AssetRegistry.setCounterpartyBeneficiary: ENTRY_DOES_NOT_EXIST"
        );
        require(
            msg.sender == prevCounterpartyBeneficiary || checkAccess(assetId, msg.sig, msg.sender),
            "AssetRegistry.setCounterpartyBeneficiary: UNAUTHORIZED_SENDER"
        );

        assets[assetId].ownership.counterpartyBeneficiary = newCounterpartyBeneficiary;

        emit UpdatedBeneficiary(assetId, prevCounterpartyBeneficiary, newCounterpartyBeneficiary);
    }

    /**
     * @notice Registers the address of the owner of specific claims of the asset.
     * @dev Can only be updated by the current beneficiary or by an authorized account.
     * @param assetId id of the asset
     * @param cashflowId id of the specific claims for which to register the owner
     * @param beneficiary the address of the owner
     */
    function setBeneficiaryForCashflowId(
        bytes32 assetId,
        int8 cashflowId,
        address beneficiary
    )
        external
    {
        require(
            cashflowId != 0,
            "AssetRegistry.setBeneficiaryForCashflowId: INVALID_CASHFLOWID"
        );

        address prevBeneficiary = assets[assetId].cashflowBeneficiaries[cashflowId];

        if (prevBeneficiary == address(0)) {
            if (cashflowId > 0) {
                require(
                    msg.sender == prevBeneficiary || checkAccess(assetId, msg.sig, msg.sender),
                    "AssetRegistry.setBeneficiaryForCashflowId: UNAUTHORIZED_SENDER"
                );
            } else {
                require(
                    msg.sender == prevBeneficiary || checkAccess(assetId, msg.sig, msg.sender),
                    "AssetRegistry.setBeneficiaryForCashflowId: UNAUTHORIZED_SENDER"
                );
            }
        } else {
            require(
                msg.sender == prevBeneficiary || checkAccess(assetId, msg.sig, msg.sender),
                "AssetRegistry.setBeneficiaryForCashflowId: UNAUTHORIZED_SENDER"
            );
        }

        assets[assetId].cashflowBeneficiaries[cashflowId] = beneficiary;

        emit UpdatedCashflowBeneficiary(
            assetId,
            cashflowId,
            prevBeneficiary,
            beneficiary
        );
    }

    /**
     * @notice Update the address of the obligor which has to fulfill obligations
     * for the creator of the asset.
     * @dev Can only be updated by an authorized account.
     * @param assetId id of the asset
     * @param newCreatorObligor address of the new creator obligor
     */
    function setCreatorObligor (bytes32 assetId, address newCreatorObligor) external {
        require(
            checkAccess(assetId, msg.sig, msg.sender),
            "AssetRegistry.setCreatorObligor: UNAUTHORIZED_SENDER"
        );

        address prevCreatorObligor = assets[assetId].ownership.creatorObligor;

        assets[assetId].ownership.creatorObligor = newCreatorObligor;

        emit UpdatedObligor(assetId, prevCreatorObligor, newCreatorObligor);
    }

    /**
     * @notice Update the address of the counterparty which has to fulfill obligations
     * for the counterparty of the asset.
     * @dev Can only be updated by an authorized account.
     * @param assetId id of the asset
     * @param newCounterpartyObligor address of the new counterparty obligor
     */
    function setCounterpartyObligor (bytes32 assetId, address newCounterpartyObligor) external {
        require(
            checkAccess(assetId, msg.sig, msg.sender),
            "AssetRegistry.setCounterpartyObligor: UNAUTHORIZED_SENDER"
        );

        address prevCounterpartyObligor = assets[assetId].ownership.counterpartyObligor;

        assets[assetId].ownership.counterpartyObligor = newCounterpartyObligor;

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
        returns (AssetOwnership memory)
    {
        return assets[assetId].ownership;
    }

    /**
     * @notice Retrieves the registered address of the owner of specific future claims from an asset.
     * @param assetId id of the asset
     * @param cashflowId the identifier of the specific claims owned by the registerd address
     * @return address of the beneficiary corresponding to the given cashflowId
     */
    function getCashflowBeneficiary(bytes32 assetId, int8 cashflowId)
        external
        view
        returns (address)
    {
        return assets[assetId].cashflowBeneficiaries[cashflowId];
    }
}
