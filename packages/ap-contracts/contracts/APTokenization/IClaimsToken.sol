pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";


interface IClaimsToken {

	/**
	 * @dev This event emits when funds to be deposited are sent to the token contract
	 * @param from contains the address of the sender of the received funds
	 * @param fundsReceived contains the amount of funds received for distribution
	 */
	event FundsReceived(address indexed from, uint256 fundsReceived);

	/**
	 * @dev This event emits when distributed funds are withdrawn by a token holder.
	 * @param by contains the address of the receiver of funds
	 * @param fundsWithdrawn contains the amount of funds that were withdrawn
	 */
	event FundsWithdrawn(address indexed by, uint256 fundsWithdrawn);

	/**
	 * @dev Withdraws available funds for user.
	 */
	function withdrawFunds() external payable;

	/**
	 * @dev Returns the amount of funds a given address is able to withdraw currently.
	 * @param _forAddress Address of ClaimsToken holder
	 * @return A uint256 representing the available funds for a given account
	 */
	function availableFunds(address _forAddress) external view returns (uint256);

	/**
	 * @dev Get cumulative funds received by ClaimsToken.
	 * @return A uint256 representing the total funds received by ClaimsToken
	 */
	function totalReceivedFunds() external view returns (uint256);
}