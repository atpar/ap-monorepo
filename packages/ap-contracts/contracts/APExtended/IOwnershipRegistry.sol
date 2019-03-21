pragma solidity ^0.5.2;


interface IOwnershipRegistry {
	
	function registerOwnership (
		bytes32 contractId,
		address recordCreatorObligor,
		address payable recordCreatorBeneficiary,
		address counterpartyObligor,
		address payable counterpartyBeneficiary
	)
		external;

	function getContractOwnership (bytes32 contractId) 
		external 
		view 
		returns (address, address payable, address, address payable);
	
	function getCashflowBeneficiary (bytes32 contractId, int8 cashflowId) 
		external 
		view 
		returns (address payable);
}
