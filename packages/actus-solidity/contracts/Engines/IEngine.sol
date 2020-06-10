pragma solidity ^0.6.4;


interface IEngine {
    function contractType() pure returns (ContractType);
}