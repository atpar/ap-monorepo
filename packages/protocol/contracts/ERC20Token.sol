// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface FaucetInterface {
    function drip(address receiver, uint tokens) external;
}

contract ERC20Token is ERC20, FaucetInterface, Ownable {
    using SafeMath for uint256;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function drip(address receiver, uint256 tokens) public override {
        _mint(receiver, tokens);
    }
}
