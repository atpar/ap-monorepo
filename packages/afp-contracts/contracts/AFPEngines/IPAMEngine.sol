pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../AFPCore/AFPDefinitions.sol";

contract IPAMEngine is AFPDefinitions {

 	function initializeContract(PAMContractTerms memory _contractTerms) 
		public 
		pure 
		returns (ContractState memory, uint256[2][MAX_EVENT_SCHEDULE_SIZE] memory);

	function getNextState(
		PAMContractTerms memory _contractTerms, 
		ContractState memory _contractState, 
		ContractEvent memory _contractEvent, 
		uint256 _timestamp
	) 
		public 
		pure 
		returns (ContractState memory, ContractEvent memory);

	function getNextState(
		PAMContractTerms memory _contractTerms, 
		ContractState memory _contractState, 
		uint256 _timestamp
	) 
		public 
		pure 
		returns (ContractState memory, ContractEvent[MAX_EVENT_SCHEDULE_SIZE] memory);
}
