pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../../../SharedTypes.sol";


interface ICEGTermsRegistry {

    function getTerms(bytes32 assetId)
        external
        view
        returns (CEGTerms memory);

    function setTerms(bytes32 assetId, CEGTerms calldata terms)
        external;
}
