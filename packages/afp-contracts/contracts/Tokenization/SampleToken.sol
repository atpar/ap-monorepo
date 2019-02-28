pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract ERC223ReceivingContract { 
  function tokenFallback(address _from, uint _value, bytes memory _data) public;
}

contract SampleToken {

	using SafeMath for uint;

  mapping(address => uint) balances;

	uint8 public constant DECIMALS = 18;
	uint256 public constant INITIAL_SUPPLY = 10000 * (10 ** uint256(DECIMALS));

	event Transfer(address indexed from, address indexed to, uint value, bytes data);


	constructor () public {
		balances[msg.sender] = balances[msg.sender].add(INITIAL_SUPPLY);
	}

	function balanceOf(address _owner) public view returns (uint256) {
    return balances[_owner];
  }

	function transfer(address _to, uint256 _value, bytes memory _data) 
		public 
		returns(bool)
	{
		uint codeLength;

		assembly { codeLength := extcodesize(_to) }

		balances[msg.sender] = balances[msg.sender].sub(_value);
		balances[_to] = balances[_to].add(_value);
		
		if(codeLength > 0) {
			ERC223ReceivingContract receiver = ERC223ReceivingContract(_to);
			receiver.tokenFallback(msg.sender, _value, _data);
		}

		emit Transfer(msg.sender, _to, _value, _data);
	}
	
	function transfer(address _to, uint256 _value) 
		public 
		returns(bool)
	{
		uint codeLength;
		bytes memory empty;

		assembly { codeLength := extcodesize(_to) }

		balances[msg.sender] = balances[msg.sender].sub(_value);
		balances[_to] = balances[_to].add(_value);

		if(codeLength > 0) {
			ERC223ReceivingContract receiver = ERC223ReceivingContract(_to);
			receiver.tokenFallback(msg.sender, _value, empty);
		}

		emit Transfer(msg.sender, _to, _value, empty);
	}
}