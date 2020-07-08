// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;

import "../Core/ACTUSTypes.sol";


interface IEngine {
    function contractType() external pure returns (ContractType);
}