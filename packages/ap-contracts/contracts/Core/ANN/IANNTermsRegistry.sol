pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../Base/SharedTypes.sol";


interface IANNTermsRegistry {

    function getTerms(bytes32 assetId)
        external
        view
        returns (ANNTerms memory);

    function setTerms(bytes32 assetId, ANNTerms calldata terms)
        external;
}
