pragma solidity ^0.6.4;


contract AssetIdRegistry {

    mapping(bytes32 => address) public registryAddressForAssetId;

    
    function getRegistryAddressForAssetId(bytes32 assetId) external view returns (address) {
        return registryAddressForAssetId[assetId];
    }

    function setRegistryAddressForAssetId(bytes32 assetId, address registryAddress) external view returns (address) {
        require (
            registryAddressForAssetId[assetId] == address(0),
            "AssetIdRegistry.setRegistryAddressForAssetId: ENTRY_ALREADY_EXISTS"
        );

        registryAddressForAssetId[assetId] = registryAddress;
    }
}