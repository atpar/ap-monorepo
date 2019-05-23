pragma solidity ^0.5.2;


interface IPaymentRegistry {

	/**
	 * whitelists the address of the payment router for registering payments
	 * @dev can only be called by the owner of the contract
	 * @param _paymentRouter address of the payment router
	 */
	function setPaymentRouter(address _paymentRouter) external;

	/**
	 * register a payment made for servicing a claim from a specific financial asset
	 * @dev can only be called by the whitelisted payment router
	 * @param assetId id of the asset to which the claim (i.e. eventId) relates
	 * @param cashflowId id of the claim which is serviced with the payment
	 * @param eventId id of the specific contractual event which is serviced with the payment
	 * @param token the address of the token contract from which tokens are transferred with the payment
	 * @param _amount the amount transferred with the payment
	 */
	function registerPayment(
		bytes32 assetId,
		int8 cashflowId,
		uint256 eventId,
		address token,
		uint256 _amount
	)
		external
		payable;

	/**
	 * retrieve the total balance (sum over all amounts) paid for servicing a specific claim
	 * @param assetId id of the asset to which the claim (i.e. eventId) relates
	 * @param eventId id of the specific contractual event for which the total balance paid should be retrieved
	 * @return current balance paid off for the given claim
	 */
	function getPayoffBalance(bytes32 assetId, uint256 eventId)
		external
		view
		returns (uint256);

	/**
	 * retrieve the full details of amounts paid for servicing a specific claim
	 * @param assetId id of the asset to which the claim (i.e. eventId) relates
	 * @param eventId id of the specific contractual event for which the total balance paid should be retrieved
	 * @return cashflowId, address of the token used to payoff the claim, current balance of the claim
	 */
	function getPayoff(bytes32 assetId, uint256 eventId)
		external
		view
		returns (int8, address, uint256);
}
