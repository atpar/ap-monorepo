pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "@atpar/actus-solidity/contracts/Engines/IEngine.sol";

import "../AssetRegistryStorage.sol";
import "../AccessControl/AccessControl.sol";
import "./ITermsRegistry.sol";


/**
 * @title TermsRegistry
 */
contract TermsRegistry is AssetRegistryStorage, AccessControl, ITermsRegistry {

    event UpdatedTerms(bytes32 indexed assetId);


    // /**
    //  * @notice Returns the terms of an asset.
    //  * @param assetId id of the asset
    //  * @return terms of the asset
    //  */
    // function getANNTerms(bytes32 assetId)
    //     external
    //     view
    //     override
    //     returns (ANNTerms memory)
    // {
    //     return assets[assetId].decodeAndGetANNTerms();
    // }

    // /**
    //  * @notice Returns the terms of an asset.
    //  * @param assetId id of the asset
    //  * @return terms of the asset
    //  */
    // function getCECTerms(bytes32 assetId)
    //     external
    //     view
    //     override
    //     returns (CECTerms memory)
    // {
    //     return assets[assetId].decodeAndGetCECTerms();
    // }

    // /**
    //  * @notice Returns the terms of an asset.
    //  * @param assetId id of the asset
    //  * @return terms of the asset
    //  */
    // function getCEGTerms(bytes32 assetId)
    //     external
    //     view
    //     override
    //     returns (CEGTerms memory)
    // {
    //     return assets[assetId].decodeAndGetCEGTerms();
    // }

    /**
     * @notice Returns the terms of an asset.
     * @param assetId id of the asset
     * @return terms of the asset
     */
    function getPAMTerms(bytes32 assetId)
        external
        view
        override
        returns (PAMTerms memory)
    {
        return assets[assetId].decodeAndGetPAMTerms();
    }

    function getEnumValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (uint8)
    {
        Asset storage asset = assets[assetId];
        ContractType contractType = IEngine(asset.engine).contractType();

        // if (contractType == ContractType.ANN) {
        //     return asset.decodeAndGetEnumValueForANNAttribute(attribute);
        // } else if (contractType == ContractType.CEC) {
        //     return asset.decodeAndGetEnumValueForCECAttribute(attribute);
        // } else if (contractType == ContractType.CEG) {
        //     return asset.decodeAndGetEnumValueForCEGAttribute(attribute);
        // } else 
        if (contractType == ContractType.PAM) {
            return asset.decodeAndGetEnumValueForPAMAttribute(attribute);
        } else {
            revert("AssetRegistry.getEnumValueForTermsAttribute: UNSUPPORTED_CONTRACT_TYPE");
        }
    }

    function getAddressValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (address)
    {
        Asset storage asset = assets[assetId];
        ContractType contractType = IEngine(asset.engine).contractType();

        // if (contractType == ContractType.ANN) {
        //     return asset.decodeAndGetAddressValueForForANNAttribute(attribute);
        // } else if (contractType == ContractType.CEC) {
        //     return asset.decodeAndGetAddressValueForForCECAttribute(attribute);
        // } else if (contractType == ContractType.CEG) {
        //     return asset.decodeAndGetAddressValueForForCEGAttribute(attribute);
        // } else
        if (contractType == ContractType.PAM) {
            return asset.decodeAndGetAddressValueForForPAMAttribute(attribute);
        } else {
            revert("AssetRegistry.getAddressValueForTermsAttribute: UNSUPPORTED_CONTRACT_TYPE");
        }
    }

    function getBytes32ValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (bytes32)
    {
        Asset storage asset = assets[assetId];
        ContractType contractType = IEngine(asset.engine).contractType();

        // if (contractType == ContractType.ANN) {
        //     return asset.decodeAndGetBytes32ValueForForANNAttribute(attribute);
        // } else if (contractType == ContractType.CEC) {
        //     return asset.decodeAndGetBytes32ValueForForCECAttribute(attribute);
        // } else if (contractType == ContractType.CEG) {
        //     return asset.decodeAndGetBytes32ValueForForCEGAttribute(attribute);
        // } else
        if (contractType == ContractType.PAM) {
            return asset.decodeAndGetBytes32ValueForForPAMAttribute(attribute);
        } else {
            revert("AssetRegistry.getBytesValueForTermsAttribute: UNSUPPORTED_CONTRACT_TYPE");
        }
    }

    function getUIntValueForForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (uint256)
    {
        Asset storage asset = assets[assetId];
        ContractType contractType = IEngine(asset.engine).contractType();

        // if (contractType == ContractType.ANN) {
        //     return asset.decodeAndGetUIntValueForForANNAttribute(attribute);
        // } else if (contractType == ContractType.CEC) {
        //     return asset.decodeAndGetUIntValueForForCECAttribute(attribute);
        // } else if (contractType == ContractType.CEG) {
        //     return asset.decodeAndGetUIntValueForForCEGAttribute(attribute);
        // } else
        if (contractType == ContractType.PAM) {
            return asset.decodeAndGetUIntValueForForPAMAttribute(attribute);
        } else {
            revert("AssetRegistry.getUIntValueForForTermsAttribute: UNSUPPORTED_CONTRACT_TYPE");
        }
    }

    function getIntValueForForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (int256)
    {
        Asset storage asset = assets[assetId];
        ContractType contractType = IEngine(asset.engine).contractType();

        // if (contractType == ContractType.ANN) {
        //     return asset.decodeAndGetIntValueForForANNAttribute(attribute);
        // } else if (contractType == ContractType.CEC) {
        //     return asset.decodeAndGetIntValueForForCECAttribute(attribute);
        // } else if (contractType == ContractType.CEG) {
        //     return asset.decodeAndGetIntValueForForCEGAttribute(attribute);
        // } else
        if (contractType == ContractType.PAM) {
            return asset.decodeAndGetIntValueForForPAMAttribute(attribute);
        } else {
            revert("AssetRegistry.getIntValueForForTermsAttribute: UNSUPPORTED_CONTRACT_TYPE");
        }
    }

    function getPeriodValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (IP memory)
    {
        Asset storage asset = assets[assetId];
        ContractType contractType = IEngine(asset.engine).contractType();

        // if (contractType == ContractType.ANN) {
        //     return asset.decodeAndGetPeriodValueForForANNAttribute(attribute);
        // } else if (contractType == ContractType.CEC) {
        //     return asset.decodeAndGetPeriodValueForForCECAttribute(attribute);
        // } else if (contractType == ContractType.CEG) {
        //     return asset.decodeAndGetPeriodValueForForCEGAttribute(attribute);
        // } else
        if (contractType == ContractType.PAM) {
            return asset.decodeAndGetPeriodValueForForPAMAttribute(attribute);
        } else {
            revert("AssetRegistry.getPeriodValueForTermsAttribute: UNSUPPORTED_CONTRACT_TYPE");
        }
    }

    function getCycleValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (IPS memory)
    {
        Asset storage asset = assets[assetId];
        ContractType contractType = IEngine(asset.engine).contractType();

        // if (contractType == ContractType.ANN) {
        //     return asset.decodeAndGetCycleValueForForANNAttribute(attribute);
        // } else if (contractType == ContractType.CEC) {
        //     return asset.decodeAndGetCycleValueForForCECAttribute(attribute);
        // } else if (contractType == ContractType.CEG) {
        //     return asset.decodeAndGetCycleValueForForCEGAttribute(attribute);
        // } else
        if (contractType == ContractType.PAM) {
            return asset.decodeAndGetCycleValueForForPAMAttribute(attribute);
        } else {
            revert("AssetRegistry.getCycleValueForTermsAttribute: UNSUPPORTED_CONTRACT_TYPE");
        }
    }

    function getContractReferenceValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (ContractReference memory)
    {
        Asset storage asset = assets[assetId];
        ContractType contractType = IEngine(asset.engine).contractType();

        // if (contractType == ContractType.ANN) {
        //     return asset.decodeAndGetContractReferenceValueForANNAttribute(attribute);
        // } else if (contractType == ContractType.CEC) {
        //     return asset.decodeAndGetContractReferenceValueForCECAttribute(attribute);
        // } else if (contractType == ContractType.CEG) {
        //     return asset.decodeAndGetContractReferenceValueForCEGAttribute(attribute);
        // } else
        if (contractType == ContractType.PAM) {
            return asset.decodeAndGetContractReferenceValueForPAMAttribute(attribute);
        } else {
            revert("AssetRegistry.getContractReferenceValueForTermsAttribute: UNSUPPORTED_CONTRACT_TYPE");
        }
    }

    // /**
    //  * @notice Set the terms of the asset
    //  * @dev Can only be set by authorized account.
    //  * @param assetId id of the asset
    //  * @param terms new terms
    //  */
    // function setANNTerms(bytes32 assetId, ANNTerms calldata terms)
    //     external
    //     override
    //     isAuthorized (assetId)
    // {
    //     assets[assetId].encodeAndSetANNTerms(terms);
    //     emit UpdatedTerms(assetId);
    // }

    // /**
    //  * @notice Set the terms of the asset
    //  * @dev Can only be set by authorized account.
    //  * @param assetId id of the asset
    //  * @param terms new terms
    //  */
    // function setCECTerms(bytes32 assetId, CECTerms calldata terms)
    //     external
    //     override
    //     isAuthorized (assetId)
    // {
    //     assets[assetId].encodeAndSetCECTerms(terms);
    //     emit UpdatedTerms(assetId);
    // }

    // /**
    //  * @notice Set the terms of the asset
    //  * @dev Can only be set by authorized account.
    //  * @param assetId id of the asset
    //  * @param terms new terms
    //  */
    // function setCEGTerms(bytes32 assetId, CEGTerms calldata terms)
    //     external
    //     override
    //     isAuthorized (assetId)
    // {
    //     assets[assetId].encodeAndSetCEGTerms(terms);
    //     emit UpdatedTerms(assetId);
    // }

    /**
     * @notice Set the terms of the asset
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param terms new terms
     */
    function setPAMTerms(bytes32 assetId, PAMTerms calldata terms)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].encodeAndSetPAMTerms(terms);
        emit UpdatedTerms(assetId);
    }    
}
