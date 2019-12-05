pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../Core/SharedTypes.sol";
import "../Core/IAssetActor.sol";
import "./VerifyOrder.sol";


contract IAssetIssuer is SharedTypes, VerifyOrder {

    event AssetIssued(bytes32 indexed assetId, address indexed creator, address indexed counterparty);


    function issueFromOrder(Order memory order) public;
}
