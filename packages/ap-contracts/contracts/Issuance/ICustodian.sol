pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../Core/SharedTypes.sol";


contract ICustodian is SharedTypes {

    event LockedCollateral(bytes32 assetId, address collateralizer, uint256 collateralAmount);


    function lockCollateral(
        bytes32 assetId,
        LifecycleTerms memory terms,
        AssetOwnership memory ownership
    )
        public
        returns (bool);

    function returnCollateral(
        bytes32 assetId
    )
        public
        returns (bool);
}