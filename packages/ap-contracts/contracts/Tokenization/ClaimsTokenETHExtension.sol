pragma solidity ^0.5.2;

import "./IClaimsToken.sol";
import "./ClaimsToken.sol";


contract ClaimsTokenETHExtension is IClaimsToken, ClaimsToken {


	constructor(address _owner)
		public
		ClaimsToken(_owner)
	{}

	/**
	 * @dev Withdraws available funds for user.
	 */
	function withdrawFunds()
		external
		payable
	{
		uint256 withdrawableFunds = _prepareWithdraw();

		msg.sender.transfer(withdrawableFunds);
	}

	/**
	 * @dev Calls _registerFunds(),
	 * whereby total received funds (cumulative) gets updated.
	 */
	function ()
		external
		payable
	{
		if (msg.value > 0) {
			_registerFunds(msg.value);
			emit FundsReceived(msg.sender, msg.value);
		}
	}
}