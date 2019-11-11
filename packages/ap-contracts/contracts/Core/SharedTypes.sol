pragma solidity ^0.5.2;

import "actus-solidity/contracts/Core/Definitions.sol";


contract SharedTypes is Definitions {

	struct AssetOwnership {
		address recordCreatorObligor;
		address payable recordCreatorBeneficiary;
		address counterpartyObligor;
		address payable counterpartyBeneficiary;
	}

	struct ProtoEventSchedules {
		bytes32[MAX_CYCLE_SIZE] nonCyclicProtoEventSchedule;
		bytes32[MAX_CYCLE_SIZE] cyclicIPProtoEventSchedule;
		bytes32[MAX_CYCLE_SIZE] cyclicPRProtoEventSchedule;
		bytes32[MAX_CYCLE_SIZE] cyclicRRProtoEventSchedule;
		bytes32[MAX_CYCLE_SIZE] cyclicPYProtoEventSchedule;
		bytes32[MAX_CYCLE_SIZE] cyclicSCProtoEventSchedule;
		bytes32[MAX_CYCLE_SIZE] cyclicFPProtoEventSchedule;
	}
}
