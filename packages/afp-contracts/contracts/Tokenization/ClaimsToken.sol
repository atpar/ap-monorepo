pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

import "./IClaimsToken.sol";


contract ClaimsToken is IClaimsToken, ERC20, ERC20Detailed {

	using SafeMath for uint256;
	
	// cumulative funds received by this contract
	uint256 public receivedFunds;
	// cumulative funds received which were already processed for distribution - by user
	mapping (address => uint256) public processedFunds;
	// claimed but not yet withdrawn funds for a user
	mapping (address => uint256) public claimedFunds;

	event Deposit(uint256 fundsDeposited);


	constructor (address _owner) 
		public 
		ERC20Detailed("ClaimsToken", "CST", 18)
	{
		_mint(_owner, 10000 * (10 ** uint256(18)));

		receivedFunds = 0;
	}

	/** 
	 * @dev Transfer token to a specified address.
	 * Claims funds for both parties, whereby the amount of tokens withdrawn 
	 * is inherited by the new token owner.
	 * @param _to The address to transfer to
	 * @param _value The amount to be transferred
	 */
	function transfer(address _to, uint256 _value)
		public
		returns (bool)
	{
		_claimFunds(msg.sender);
		_claimFunds(_to);

		return super.transfer(_to, _value);
	}


	/**
	 * @dev Transfer tokens from one address to another.
	 * Claims funds for both parties, whereby the amount of tokens withdrawn
	 * is inherited by the new token owner.
	 * @param _from address The address which you want to send tokens from
	 * @param _to address The address which you want to transfer to
	 * @param _value uint256 the amount of tokens to be transferred
	 */
	function transferFrom(address _from, address _to, uint256 _value)
		public
		returns (bool)
	{
		_claimFunds(_from);
		_claimFunds(_to);

		return super.transferFrom(_from, _to, _value);
	}

	/**
	 * @dev Get cumulative funds received by ClaimsToken.
	 * @return A uint256 representing the total funds received by ClaimsToken
	 */
	function totalReceivedFunds () 
		external 
		view 
		returns (uint256) 
	{
		return receivedFunds;
	}

	/**
	 * @dev Returns the amount of funds a given address is able to withdraw currently.
	 * @param _address Address of ClaimsToken holder
	 * @return A uint256 representing the available funds for a given account
	 */
	function availableFunds(address _address)
		public
		view
		returns (uint256) 
	{
		return _calcUnprocessedFunds(_address).add(claimedFunds[_address]);
	}

	/**
	 * @dev Increment cumulative received funds by new received funds. 
	 * Called when ClaimsToken receives funds.
	 * @param _value Amount of tokens / Ether received
	 */
	function _registerFunds(uint256 _value) 
		internal
	{
		receivedFunds = receivedFunds.add(_value);
		
		emit Deposit(_value);
	}

	/**
	 * @dev Returns payout for a user which can be withdrawn or claimed.
	 * @param _address Address of ClaimsToken holder
	 */
	function _calcUnprocessedFunds(address _address) 
		internal 
		view
		returns (uint256) 
	{
		uint256 newReceivedFunds = receivedFunds.sub(processedFunds[_address]);
		return balanceOf(_address).mul(newReceivedFunds).div(totalSupply());
	}

	/**
	 * @dev Claims funds for a user.
	 * @param _address Address of ClaimsToken holder
	 */
	function _claimFunds(address _address) internal {
		uint256 unprocessedFunds = _calcUnprocessedFunds(_address);

		processedFunds[_address] = receivedFunds;
		claimedFunds[_address] = claimedFunds[_address].add(unprocessedFunds);
	}

		/**
	 * @dev Withdraws available funds for user and returns the withdrawable amount.
	 * @return A uint256 representing the withdrawable funds
	 */
	function _prepareWithdraw() 
		internal 
		returns (uint256)
	{
		uint256 withdrawableFunds = availableFunds(msg.sender);

		processedFunds[msg.sender] = receivedFunds;
		claimedFunds[msg.sender] = 0;

		return withdrawableFunds;
	}
}