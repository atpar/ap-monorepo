pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../SharedTypes.sol";


interface IAssetActor {

    function progress(bytes32 assetId)
        external;

    function progressWith(bytes32 assetId, bytes32 _event)
        external;
}
