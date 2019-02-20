pragma solidity ^0.5.2;

interface PaymentRegistryInterface {
	
	function registerPayment (
		bytes32 _contractId,
		int8 _cashflowId, 
		bytes32 _eventId, 
		address _token,
		uint256 _amount
	) 
		external;
}
