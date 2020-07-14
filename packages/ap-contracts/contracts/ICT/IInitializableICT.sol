// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;


interface IInitializableICT {
    /**
     * @dev Inits an ICT contract
     */
    function initialize(
        address _assetRegistry,
        address _dataRegistry,
        bytes32 _marketObjectCode,
        address owner
    ) external;
}
