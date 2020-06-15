pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../Base/SharedTypes.sol";


interface IPAMTermsRegistry {

    function getTerms(bytes32 assetId)
        external
        view
        returns (PAMTerms memory);

    function setTerms(bytes32 assetId, PAMTerms calldata terms)
        external;
}
