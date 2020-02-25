pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../Core/SharedTypes.sol";
import "../Core/AssetActor/IAssetActor.sol";
import "./VerifyOrder.sol";


contract IAssetIssuer is SharedTypes, VerifyOrder {

    struct Draft {
        bytes32 termsHash;
        bytes32 templateId;
        CustomTerms customTerms;
        AssetOwnership ownership;
        address engine;
        address actor;
    }


    function issueFromDraft(Draft memory draft) public;

    function issueFromOrder(Order memory order) public;
}
