pragma solidity ^0.5.2;

import "./external/open-zeppelin-solidity/ERC20.sol";
import "./external/open-zeppelin-solidity/ERC20Detailed.sol";

contract CustomToken is ERC20, ERC20Detailed {

	constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _supply) 
		ERC20() 
		ERC20Detailed(_name, _symbol, _decimals) 
		public 
	{
		_mint(msg.sender, _supply);
	}
}