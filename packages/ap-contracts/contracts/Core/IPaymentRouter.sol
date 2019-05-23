pragma solidity ^0.5.2;


interface IPaymentRouter {

	/**
	 * routes a payment to the designated beneficiary and
	 * registers that the payment was made in the payment registry
	 * @dev checks if an owner of the specified cashflowId is set,
	 * if not it sends funds to the default beneficiary
	 * @param assetId id of the asset which the payment relates to
	 * @param cashflowId id of the claim ((EventType + 1) * direction of the payment)
	 * @param eventId id of the event (order in the event schedule)
	 * @param token address of the token to pay (0x0 if paid in Ether)
	 * @param _amount payment amount
	 */
	function settlePayment(
		bytes32 assetId,
		int8 cashflowId,
		uint256 eventId,
		address token,
		uint256 _amount
	)
		external
		payable;
}
