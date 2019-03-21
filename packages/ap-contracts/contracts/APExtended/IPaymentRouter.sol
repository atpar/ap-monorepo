pragma solidity ^0.5.2;


interface IPaymentRouter {

	function settlePayment (
		bytes32 contractId,
		int8 cashflowId,
		uint256 eventId,
		address token,
		uint256 amount
	) 
		external 
		payable;
}
