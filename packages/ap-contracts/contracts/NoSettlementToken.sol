// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";


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

contract NoSettlementToken is ERC20Interface {

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);

    string public name;
    string public symbol;
    uint8 public decimals;


    constructor() public {
        symbol = "NO_STLMT";
        name = "No Settlement Token";
        decimals = 18;
    }
    
    function transfer(address to, uint tokens) external override returns (bool success) {
        emit Transfer(msg.sender, to, tokens);
        return true;
    }

    function transferFrom(address from, address to, uint tokens) external override returns (bool success) {
        emit Transfer(from, to, tokens);
        return true;
    }

    function approve(address spender, uint tokens) external override returns (bool success) {
        emit Approval(msg.sender, spender, tokens);
        return true;
    }

    function totalSupply() external view override returns (uint) {
        return ~uint256(0);
    }

    function balanceOf(address /* tokenOwner */) external view override returns (uint balance) {
        return ~uint256(0);
    }

    function allowance(address /* tokenOwner */, address /* spender */) external view override returns (uint remaining) {
        return ~uint256(0);
    }
}
