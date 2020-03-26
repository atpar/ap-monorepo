pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../Core/SharedTypes.sol";


abstract contract ICustodian is SharedTypes {

    function lockCollateral(
        bytes32 assetId,
        LifecycleTerms memory terms,
        AssetOwnership memory ownership
    )
        public
        virtual
        returns (bool);

    function returnCollateral(
        bytes32 assetId
    )
        public
        virtual
        returns (bool);
}