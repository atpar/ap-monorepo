pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./AFPCore/AFPDefinitions.sol";
import "./AFPCore/AFPVerify.sol";

/**
 * @title the stateful component for a PAM contract
 * @dev not optimized for gas consumption
 */
contract PAMStatefulContractOffChain is AFPDefinitions, AFPVerify {

	/**
		1. initial contract update
			- verify signatures
			- save contractterms hash and contractstate hash
			- save recordcreator address and counterparty address
			- init nonce = 0
		2. future contract updates
			- verify signatures with saved addresses of recordcreator and counterparty and contractterms hash
			- save contractstate hash
			- increment nonce + 1 
	 */

	 event State(
		address recordCreator,
		address counterparty,
		bytes32 contractTermsHash,
		bytes32 contractStateHash,
		uint256 contractUpdateNonce
	);

	event Event(
		EventType eventType, 
		uint256 scheduledTime, 
		uint256 actualEventTime, 
		int256 payOff, 
		Currency currency
	);

	address payable public recordCreator;
	address payable public counterparty;

	bytes32 public contractId;
	bytes32 public contractTermsHash;
	uint256 public contractUpdateNonce;

	modifier onlyRecordCreatorOrCounterparty() {
		require(msg.sender == recordCreator || msg.sender == counterparty);
		_;
	}
 

	/**
	 * @notice constructor for creating the PAMStatefulContract
	 * @param _initialContractUpdate initial contract update to register
	 * @param _recordCreatorSignature record creator signature of the contract update
	 * @param _counterpartySignature counterparty signature of the contract update
	 */
	constructor(
		ContractUpdate memory _initialContractUpdate,
		bytes memory _recordCreatorSignature, 
		bytes memory _counterpartySignature
	) 
		public 
	{
		verifyContractUpdate(_initialContractUpdate, _recordCreatorSignature, _counterpartySignature);

		recordCreator = _initialContractUpdate.recordCreatorAddress;
		counterparty = _initialContractUpdate.counterpartyAddress;
		contractId = _initialContractUpdate.contractId;
		contractTermsHash = _initialContractUpdate.contractTermsHash;
	}

	/**
	 * @notice registers a contract update
	 * @param _contractUpdate contract update to register
	 * @param _recordCreatorSignature record creator signature of the contract update
	 * @param _counterpartySignature counterparty signature of the contract update
	 * @param _contractEvents evaluated contract events of the contract update
	 */
	function registerContractUpdate(
		ContractUpdate memory _contractUpdate,  
		bytes memory _recordCreatorSignature, 
		bytes memory _counterpartySignature,
		ContractEvent[MAX_EVENT_SCHEDULE_SIZE] memory _contractEvents
	) 
		public
		payable
	{
		require(_contractUpdate.contractId == contractId, "supplied contractId differs");
		require(
			_contractUpdate.recordCreatorAddress == recordCreator &&
			_contractUpdate.counterpartyAddress == counterparty,
			"supplied addresses of record creator or counterparty differs"
		);
		require(
			_contractUpdate.contractTermsHash == contractTermsHash, 
			"supplied contractTermsHash differs"
		);
		require(
			_contractUpdate.contractUpdateNonce == contractUpdateNonce + 1, 
			"supplied contractUpdateNonce is invalid"
		);

		verifyContractUpdate(_contractUpdate, _recordCreatorSignature, _counterpartySignature);

		emit State(
			recordCreator,
			counterparty,
			_contractUpdate.contractTermsHash,
			_contractUpdate.contractStateHash,
			_contractUpdate.contractUpdateNonce
		);

		int256 payOff = 0;

		for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
			if (_contractEvents[i].scheduledTime == 0) { break; }
			payOff += _contractEvents[i].payOff;

			emit Event(
				_contractEvents[i].eventType,
				_contractEvents[i].scheduledTime, 
				_contractEvents[i].actualEventTime,
				_contractEvents[i].payOff,
				_contractEvents[i].currency
			);
		}

		if (payOff != 0) {
			if (payOff > 0) {
				require(msg.value == uint256(payOff), "msg.value is not equal to payOff");
				address(recordCreator).transfer(msg.value);
			} else {
				require(msg.value == uint256(-payOff), "msg.value is not equal to payOff");
				address(counterparty).transfer(msg.value);
			}
		}

		contractUpdateNonce = _contractUpdate.contractUpdateNonce;
	}
}