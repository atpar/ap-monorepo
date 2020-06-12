pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../../SharedTypes.sol";


abstract contract TermsRegistry {

    event UpdatedTerms(bytes32 indexed assetId);


    function getEnumValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        virtual
        returns (uint8);

    function getAddressValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        virtual
        returns (address);

    function getBytes32ValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        virtual
        returns (bytes32);

    function getUIntValueForForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        virtual
        returns (uint256);

    function getIntValueForForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        virtual
        returns (int256);

    function getPeriodValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        virtual
        returns (IP memory);

    function getCycleValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        virtual
        returns (IPS memory);

    function getContractReferenceValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        virtual
        returns (ContractReference memory);
}
