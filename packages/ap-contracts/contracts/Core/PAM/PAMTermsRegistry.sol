pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "@atpar/actus-solidity/contracts/Engines/IEngine.sol";

import "../Base/AssetRegistry/BaseRegistryStorage.sol";
import "../Base/AssetRegistry/AccessControl/AccessControl.sol";
import "../Base/AssetRegistry/Terms/TermsRegistry.sol";
import "./PAMEncoder.sol";
import "./IPAMTermsRegistry.sol";


/**
 * @title TermsRegistry
 */
contract PAMTermsRegistry is BaseRegistryStorage, AccessControl, TermsRegistry, IPAMTermsRegistry {

    using PAMEncoder for Asset;

    /**
     * @notice Returns the terms of an asset.
     * @param assetId id of the asset
     * @return terms of the asset
     */
    function getTerms(bytes32 assetId)
        external
        view
        override
        returns (PAMTerms memory)
    {
        return assets[assetId].decodeAndGetPAMTerms();
    }

    /**
     * @notice Set the terms of the asset
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param terms new terms
     */
    function setTerms(bytes32 assetId, PAMTerms calldata terms)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].encodeAndSetPAMTerms(terms);
        emit UpdatedTerms(assetId);
    }

    function getTermsAsBytes(bytes32 assetId)
        external
        view
        override
        returns (bytes memory)
    {
        return abi.encode(assets[assetId].decodeAndGetPAMTerms());
    }

    function getEnumValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (uint8)
    {
        return assets[assetId].decodeAndGetEnumValueForPAMAttribute(attribute);
    }

    function getAddressValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (address)
    {
        return assets[assetId].decodeAndGetAddressValueForForPAMAttribute(attribute);
    }

    function getBytes32ValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (bytes32)
    {
        return assets[assetId].decodeAndGetBytes32ValueForForPAMAttribute(attribute);
    }

    function getUIntValueForForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (uint256)
    {
        return assets[assetId].decodeAndGetUIntValueForForPAMAttribute(attribute);
    }

    function getIntValueForForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (int256)
    {
        return assets[assetId].decodeAndGetIntValueForForPAMAttribute(attribute);
    }

    function getPeriodValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (IP memory)
    {
        return assets[assetId].decodeAndGetPeriodValueForForPAMAttribute(attribute);
    }

    function getCycleValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (IPS memory)
    {
        return assets[assetId].decodeAndGetCycleValueForForPAMAttribute(attribute);
    }

    function getContractReferenceValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (ContractReference memory)
    {
        return assets[assetId].decodeAndGetContractReferenceValueForPAMAttribute(attribute);
    } 
}
