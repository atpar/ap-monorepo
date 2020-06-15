pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../../../SharedTypes.sol";


interface ICECTermsRegistry {

    function getTerms(bytes32 assetId)
        external
        view
        returns (CECTerms memory);

    function setTerms(bytes32 assetId, CECTerms calldata terms)
        external;
}
