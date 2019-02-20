pragma solidity ^0.5.2;

interface OwnershipRegistryInterface {
	
	function getContractOwnership (bytes32 _contractId) 
		external 
		view 
		returns (address, address payable, address, address payable);
	
	function getCashflowBeneficiary (bytes32 _contractId, int8 _cashflowId) 
		external 
		view 
		returns (address payable);
}
