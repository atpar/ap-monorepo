pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./AFPCore/AFPDefinitions.sol";

contract PAMStatefulContractOffChain_Registry is AFPDefinitions {
	
	event PayOff(
		bytes32 indexed contractUpdateHash,
		int256 payOff
	);

	event Event(
		bytes32 indexed contractUpdateHash,
		EventType eventType, 
		uint256 scheduledTime, 
		int256 payOff
	);

	address payable public recordCreator;
	address payable public counterparty;
	bytes32 public assetId;
	bytes32 public lastContractUpdateHash;

	modifier onlyRecordCreatorOrCounterparty() {
		require(msg.sender == recordCreator || msg.sender == counterparty);
		_;
	}

	constructor(
		bytes32 _assetId,
		address payable _recordCreator, 
		address payable _counterparty
	) public {
		assetId = _assetId;
		recordCreator = _recordCreator;
		counterparty = _counterparty;
	}

	function settlePayOff(
		bytes32 _contractUpdateHash,
		ContractEvent[MAX_EVENT_SCHEDULE_SIZE] memory _contractEvents
	)
		public
		payable
		onlyRecordCreatorOrCounterparty()
	{
		require(_contractUpdateHash != lastContractUpdateHash, "payOff of contract update is already settled");
		int256 payOff = 0;

		for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
			if (_contractEvents[i].scheduledTime == 0) { break; }
			payOff += _contractEvents[i].payOff;

			emit Event(
				_contractUpdateHash,
				_contractEvents[i].eventType,
				_contractEvents[i].scheduledTime, 
				_contractEvents[i].payOff
			);
		}

		emit PayOff(_contractUpdateHash, payOff);

		if (payOff != 0) {
			if (payOff > 0) {
				require(msg.value == uint256(payOff), "msg.value is not equal to payOff");
				address(recordCreator).transfer(msg.value);
			} else {
				require(msg.value == uint256(-payOff), "msg.value is not equal to payOff");
				address(counterparty).transfer(msg.value);
			}
		}
	}
}