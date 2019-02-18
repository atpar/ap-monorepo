pragma solidity ^0.5.2;

interface PaymentRegistryInterface {
	
	function registerPayment (
		bytes32 _contractId, 
		bytes32 _eventId, 
		address _token,
		uint256 _amount
	) 
		external;
}
