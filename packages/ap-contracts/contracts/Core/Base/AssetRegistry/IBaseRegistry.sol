// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;


interface IBaseRegistry {

    function isRegistered(bytes32 assetId)
        external
        view
        returns (bool);

    function getEngine(bytes32 assetId)
        external
        view
        returns (address);

    function getActor(bytes32 assetId)
        external
        view
        returns (address);

    function setEngine(bytes32 assetId, address engine)
        external;

    function setActor(bytes32 assetId, address actor)
        external;
}
