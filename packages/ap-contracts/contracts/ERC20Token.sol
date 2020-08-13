// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";


interface FaucetInterface {
    function drip(address receiver, uint tokens) external;
}

contract SettlementToken is ERC20, FaucetInterface, Ownable {
    using SafeMath for uint256;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) public
        {}

    // solhint-disable-next-line no-complex-fallback
    fallback () external payable {
        if (msg.value > 0) {
            msg.sender.transfer(msg.value);
        }
    }

    function drip(address receiver, uint256 tokens) public override {
        _mint(receiver, tokens);
    }
}
