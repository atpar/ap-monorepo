pragma solidity ^0.5.2;


interface IPaymentRegistry {

	function setPaymentRouter(address paymentRouter) external;
	
	function registerPayment(
		bytes32 contractId,
		int8 cashflowId, 
		uint256 eventId, 
		address token,
		uint256 amount
	) 
		external
		payable;

	function getPayoffBalance(bytes32 contractId, uint256 eventId)
		external
		view
		returns (uint256);
	
	function getPayoff(bytes32 contractId, uint256 eventId)
		external
		view
		returns (int8, address, uint256);
}
