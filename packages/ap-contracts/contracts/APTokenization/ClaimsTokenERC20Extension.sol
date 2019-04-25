pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/drafts/SignedSafeMath.sol";

import "./IClaimsToken.sol";
import "./ClaimsToken.sol";


contract ClaimsTokenERC20Extension is IClaimsToken, ClaimsToken {

	using SignedSafeMath for int256;

	// token that ClaimsToken takes in custodianship 
	IERC20 public fundsToken;
	
	// balance of funds token the ClaimsToken currently holds
	uint256 public fundsTokenBalance;


	modifier onlyFundsToken () {
		require(msg.sender == address(fundsToken), "UNAUTHORIZED_SENDER");
		_;
	}

	constructor(address _owner, IERC20 _fundsToken) 
		public 
		ClaimsToken(_owner)
	{
		require(address(_fundsToken) != address(0));

		fundsToken = _fundsToken;
	}

	/**
	 * @dev Withdraws available funds for user.
	 */
	function withdrawFunds() 
		external 
		payable 
	{
		require(msg.value == 0, "");

		uint256 withdrawableFunds = _prepareWithdraw();
		
		require(fundsToken.transfer(msg.sender, withdrawableFunds), "TRANSFER_FAILED");

		_updateFundsTokenBalance();
	}

	/**
	 * @dev Updates the current funds token balance 
	 * and returns the difference of new and previous funds token balances
	 * @return A int256 representing the difference of the new and previous funds token balance
	 */
	function _updateFundsTokenBalance() internal returns (int256) {
		uint256 prevFundsTokenBalance = fundsTokenBalance;
		
		fundsTokenBalance = fundsToken.balanceOf(address(this));

		return int256(fundsTokenBalance).sub(int256(prevFundsTokenBalance));
	}

	/**
	 * May be called directly after a deposit is made
	 * @dev Calls _updateFundsTokenBalance(), whereby the contract computes the delta of the previous and the new 
	 * funds token balance and increments the total received funds (cumulative) by delta by calling _registerFunds()
	 */
	function updateFundsReceived() external {
		int256 newFunds = _updateFundsTokenBalance();

		if (newFunds > 0) {
			_registerFunds(uint256(newFunds));
			emit FundsReceived(address(0), uint256(newFunds));
		}
	}
}