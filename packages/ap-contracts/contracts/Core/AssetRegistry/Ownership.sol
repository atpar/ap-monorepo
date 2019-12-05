pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./AssetRegistryStorage.sol";


contract Ownership is AssetRegistryStorage {

    /**
     * update the address of the default beneficiary of cashflows going to the creator
     * @param assetId id of the asset
     * @param newCreatorBeneficiary address of the new beneficiary
     */
    function setCreatorBeneficiary(
        bytes32 assetId,
        address newCreatorBeneficiary
    )
        external
    {
        require(
            assets[assetId].ownership.creatorBeneficiary != address(0),
            "AssetRegistry.setCreatorBeneficiary: ENTRY_DOES_NOT_EXIST"
        );
        require(
            msg.sender == assets[assetId].ownership.creatorBeneficiary,
            "AssetRegistry.setCreatorBeneficiary: UNAUTHORIZED_SENDER"
        );

        assets[assetId].ownership.creatorBeneficiary = newCreatorBeneficiary;
    }

    /**
     * update the address of the default beneficiary of cashflows going to the counterparty
     * @param assetId id of the asset
     * @param newCounterpartyBeneficiary address of the new beneficiary
     */
    function setCounterpartyBeneficiary(
        bytes32 assetId,
        address newCounterpartyBeneficiary
    )
        external
    {
        require(
            assets[assetId].ownership.counterpartyBeneficiary != address(0),
            "AssetRegistry.setCounterpartyBeneficiary: ENTRY_DOES_NOT_EXIST"
        );
        require(
            msg.sender == assets[assetId].ownership.counterpartyBeneficiary,
            "AssetRegistry.setCounterpartyBeneficiary: UNAUTHORIZED_SENDER"
        );

        assets[assetId].ownership.counterpartyBeneficiary = newCounterpartyBeneficiary;
    }

    /**
     * register the address of the owner of specific claims of the asset
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

        if (assets[assetId].cashflowBeneficiaries[cashflowId] == address(0)) {
            if (cashflowId > 0) {
                require(
                    msg.sender == assets[assetId].ownership.creatorBeneficiary,
                    "AssetRegistry.setBeneficiaryForCashflowId: UNAUTHORIZED_SENDER"
                );
            } else {
                require(
                    msg.sender == assets[assetId].ownership.counterpartyBeneficiary,
                    "AssetRegistry.setBeneficiaryForCashflowId: UNAUTHORIZED_SENDER"
                );
            }
        } else {
            require(
                msg.sender == assets[assetId].cashflowBeneficiaries[cashflowId],
                "AssetRegistry.setBeneficiaryForCashflowId: UNAUTHORIZED_SENDER"
            );
        }

        assets[assetId].cashflowBeneficiaries[cashflowId] = beneficiary;
    }

    /**
     * retrieve the registered addresses of owners (creator, counterparty) of an asset
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
     * retrieve the registered address of the owner of specific future claims from an asset
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
