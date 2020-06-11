pragma solidity ^0.6.4;

import "../Core/ACTUSTypes.sol";


interface IEngine {
    function contractType() external pure returns (ContractType);
}