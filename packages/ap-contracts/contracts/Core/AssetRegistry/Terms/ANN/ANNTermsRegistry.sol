pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "@atpar/actus-solidity/contracts/Engines/IEngine.sol";

import "../../BaseRegistryStorage.sol";
import "../../AccessControl/AccessControl.sol";
import "../TermsRegistry.sol";
import "./ANNEncoder.sol";
import "./IANNTermsRegistry.sol";


/**
 * @title TermsRegistry
 */
contract ANNTermsRegistry is BaseRegistryStorage, AccessControl, TermsRegistry, IANNTermsRegistry {

    using ANNEncoder for Asset;


    /**
     * @notice Returns the terms of an asset.
     * @param assetId id of the asset
     * @return terms of the asset
     */
    function getTerms(bytes32 assetId)
        external
        view
        override
        returns (ANNTerms memory)
    {
        return assets[assetId].decodeAndGetANNTerms();
    }

    /**
     * @notice Set the terms of the asset
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param terms new terms
     */
    function setTerms(bytes32 assetId, ANNTerms calldata terms)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].encodeAndSetANNTerms(terms);
        emit UpdatedTerms(assetId);
    }   

    function getEnumValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (uint8)
    {
        return assets[assetId].decodeAndGetEnumValueForANNAttribute(attribute);
    }

    function getAddressValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (address)
    {
        return assets[assetId].decodeAndGetAddressValueForForANNAttribute(attribute);
    }

    function getBytes32ValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (bytes32)
    {
        return assets[assetId].decodeAndGetBytes32ValueForForANNAttribute(attribute);
    }

    function getUIntValueForForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (uint256)
    {
        return assets[assetId].decodeAndGetUIntValueForForANNAttribute(attribute);
    }

    function getIntValueForForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (int256)
    {
        return assets[assetId].decodeAndGetIntValueForForANNAttribute(attribute);
    }

    function getPeriodValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (IP memory)
    {
        return assets[assetId].decodeAndGetPeriodValueForForANNAttribute(attribute);
    }

    function getCycleValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (IPS memory)
    {
        return assets[assetId].decodeAndGetCycleValueForForANNAttribute(attribute);
    }

    function getContractReferenceValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (ContractReference memory)
    {
        return assets[assetId].decodeAndGetContractReferenceValueForANNAttribute(attribute);
    } 
}
