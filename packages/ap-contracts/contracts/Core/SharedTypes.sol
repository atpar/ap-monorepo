pragma solidity ^0.5.2;

import "actus-solidity/contracts/Core/Definitions.sol";


contract SharedTypes is Definitions {

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
