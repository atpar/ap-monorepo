pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "./Economics/IEconomics.sol";
import "./Ownership/IOwnership.sol";


abstract contract IAssetRegistry is IEconomics, IOwnership {

    function isRegistered(bytes32 assetId)
        external
        view
        virtual
        returns (bool);

    function registerAsset(
        bytes32 assetId,
        AssetOwnership calldata ownership,
        PAMTerms calldata terms,
        State calldata state,
        address engine,
        address actor,
        address root
    )
        external
        virtual;
}
