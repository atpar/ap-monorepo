pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../APCore/APDefinitions.sol";


contract IPAMEngine is APDefinitions {

	function computeInitialState(ContractTerms memory contractTerms) 
		public 
		pure 
		returns (ContractState memory);

	function computeNextState(
		ContractTerms memory contractTerms, 
		ContractState memory contractState, 
		uint256 timestamp
	)
		public
		pure
		returns (ContractState memory, ContractEvent[MAX_EVENT_SCHEDULE_SIZE] memory);

	function computeNextStateForProtoEvent(
		ContractTerms memory contractTerms, 
		ContractState memory contractState, 
		ProtoEvent memory protoEvent,
		uint256 timestamp
	)
		public
		pure
		returns (ContractState memory, ContractEvent memory);
}
