pragma solidity ^0.5.2;


interface IPaymentRegistry {

	function setPaymentRouter (address _paymentRouter) external;
	
	function registerPayment (
		bytes32 _contractId,
		int8 _cashflowId, 
		uint256 _eventId, 
		address _token,
		uint256 _amount
	) 
		external;

	function getPayoffBalance (bytes32 _contractId, uint256 _eventId)
		external
		view
		returns (uint256);
	
	function getPayoff (bytes32 _contractId, uint256 _eventId)
		external
		view
		returns (int8, address, uint256);
}
