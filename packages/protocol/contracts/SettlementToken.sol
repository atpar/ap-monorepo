// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface ERC20Interface {
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
    
    function transfer(address to, uint tokens) external returns (bool success);
    function transferFrom(address from, address to, uint tokens) external returns (bool success);
    function approve(address spender, uint tokens) external returns (bool success);
    function totalSupply() external view returns (uint);
    function balanceOf(address tokenOwner) external view returns (uint balance);
    function allowance(address tokenOwner, address spender) external view returns (uint remaining);
}

interface FaucetInterface {
    function drip(address receiver, uint tokens) external;
}

interface ApproveAndCallFallBack {
    function receiveApproval(address from, uint256 tokens, address token, bytes calldata data) external;
}

contract SettlementToken is ERC20, FaucetInterface, Ownable {
    using SafeMath for uint256;

    constructor() ERC20("STLMT", "Settlement Token") {
        uint256 amount = 1000000 * (10**18);
        _mint(msg.sender, amount);
    }

    function approveAndCall(address spender, uint256 tokens, bytes memory data) public returns (bool success) {
        // allowed[msg.sender][spender] = tokens;
        // emit Approval(msg.sender, spender, tokens);
        _approve(msg.sender, spender, tokens);
        ApproveAndCallFallBack(spender).receiveApproval(msg.sender, tokens, address(this), data);
        return true;
    }

    function drip(address receiver, uint256 tokens) public override {
        _mint(receiver, tokens);
    }

    function transferAnyERC20Token(address tokenAddress, uint256 tokens) public onlyOwner returns (bool success) {
        return IERC20(tokenAddress).transfer(owner(), tokens);
    }
}
