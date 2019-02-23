pragma solidity ^0.5.2;


interface IPaymentRegistry {
	
	function registerPayment (
		bytes32 _contractId,
		int8 _cashflowId, 
		uint256 _eventId, 
		address _token,
		uint256 _amount
	) 
		external;
}
