pragma solidity ^0.6.4;


interface IAssetIdRegistry {

    function getRegistryAddressForAssetId(bytes32 assetId) external view returns (address);

    function setRegistryAddressForAssetId(bytes32 assetId, address registryAddress) external view returns (address);
}