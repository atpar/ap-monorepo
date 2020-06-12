pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../../SharedTypes.sol";


interface ITermsRegistry {

    function getANNTerms(bytes32 assetId)
        external
        view
        returns (ANNTerms memory);

    // function getCECTerms(bytes32 assetId)
    //     external;
    //     view
    //     returns (CECTerms memory);

    // function getCEGTerms(bytes32 assetId)
    //     external;
    //     view
    //     returns (CEGTerms memory);

    function getPAMTerms(bytes32 assetId)
        external
        view
        returns (PAMTerms memory);

    function getEnumValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (uint8);

    function getAddressValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (address);

    function getBytes32ValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (bytes32);

    function getUIntValueForForTermsAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (uint256);

    function getIntValueForForTermsAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (int256);

    function getPeriodValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (IP memory);

    function getCycleValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (IPS memory);

    function getContractReferenceValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (ContractReference memory);

    function setANNTerms(bytes32 assetId, ANNTerms calldata terms)
        external;

    // function setCECTerms(bytes32 assetId, CECTerms calldata terms)
    //     external;

    // function setCEGTerms(bytes32 assetId, CEGTerms calldata terms)
    //     external;

    function setPAMTerms(bytes32 assetId, PAMTerms calldata terms)
        external;
}
