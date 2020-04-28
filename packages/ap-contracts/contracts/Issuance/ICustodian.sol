pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../Core/SharedTypes.sol";


abstract contract ICustodian is SharedTypes {

    function lockCollateral(
        bytes32 assetId,
        LifecycleTerms calldata terms,
        AssetOwnership calldata ownership
    )
        external
        virtual
        returns (bool);

    function returnCollateral(
        bytes32 assetId
    )
        external
        virtual
        returns (bool);
}