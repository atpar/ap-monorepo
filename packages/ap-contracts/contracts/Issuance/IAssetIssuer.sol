pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../Core/SharedTypes.sol";
import "../Core/AssetActor/IAssetActor.sol";
import "./VerifyOrder.sol";


contract IAssetIssuer is SharedTypes, VerifyOrder {

    function issueFromOrder(Order memory order) public;
}
