pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../../SharedTypes.sol";


abstract contract IOwnership {

    function setCreatorObligor (bytes32 assetId, address newCreatorObligor)
        external
        virtual;

    function setCounterpartyObligor (bytes32 assetId, address newCounterpartyObligor)
        external
        virtual;

    function setCreatorBeneficiary(bytes32 assetId, address newCreatorBeneficiary)
        external
        virtual;

    function setCounterpartyBeneficiary(bytes32 assetId, address newCounterpartyBeneficiary)
        external
        virtual;

    function setBeneficiaryForCashflowId(bytes32 assetId, int8 cashflowId, address beneficiary)
        external
        virtual;

    function getOwnership(bytes32 assetId)
        external
        view
        virtual
        returns (AssetOwnership memory);

    function getCashflowBeneficiary(bytes32 assetId, int8 cashflowId)
        external
        view
        virtual
        returns (address);
}
