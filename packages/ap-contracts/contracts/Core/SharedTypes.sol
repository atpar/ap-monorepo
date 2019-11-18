pragma solidity ^0.5.2;

import "actus-solidity/contracts/Core/Definitions.sol";


contract SharedTypes is Definitions {

	uint8 constant NON_CYCLIC_INDEX = ~uint8(0);

	struct ProtoEventSchedule {
		mapping(uint256 => bytes32) protoEventSchedule;
		uint256 numberOfProtoEvents;
	}

	struct AssetOwnership {
		address recordCreatorObligor;
		address recordCreatorBeneficiary;
		address counterpartyObligor;
		address counterpartyBeneficiary;
	}

	struct ProtoEventSchedules {
		bytes32[MAX_EVENT_SCHEDULE_SIZE] nonCyclicProtoEventSchedule;
		bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicIPProtoEventSchedule;
		bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicPRProtoEventSchedule;
		bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicRRProtoEventSchedule;
		bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicPYProtoEventSchedule;
		bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicSCProtoEventSchedule;
		bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicFPProtoEventSchedule;
	}
}
