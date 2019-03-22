pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./IContractActor.sol";
import "./IOwnershipRegistry.sol";
import "./IAssetRegistry.sol";
import "./IPaymentRegistry.sol";
import "./IPaymentRouter.sol";

import "../APCore/APDefinitions.sol";
import "../APEngines/IPAMEngine.sol";


contract PAMContractActor is APDefinitions, IContractActor {

	IOwnershipRegistry ownershipRegistry;
	IAssetRegistry assetRegistry;
	IPaymentRegistry paymentRegistry;
	IPaymentRouter paymentRouter;

	IPAMEngine pamEngine;


	constructor (
		IOwnershipRegistry _ownershipRegistry,
		IAssetRegistry _assetRegistry,
		IPaymentRegistry _paymentRegistry,
		IPaymentRouter _paymentRouter,
		IPAMEngine _pamEngine
	) 
		public 
	{
		ownershipRegistry = _ownershipRegistry;
		assetRegistry = _assetRegistry;
		paymentRegistry = _paymentRegistry;
		paymentRouter = _paymentRouter;
		pamEngine = _pamEngine;
	}

	function progress(
		bytes32 contractId,
		uint256 timestamp
	) 
		external
		returns (bool)
	{
		ContractTerms memory terms = assetRegistry.getTerms(contractId);
		ContractState memory state = assetRegistry.getState(contractId);
		
		require(terms.statusDate != uint256(0), "ENTRY_DOES_NOT_EXIST");
		require(state.lastEventTime != uint256(0), "ENTRY_DOES_NOT_EXIST");
		require(state.contractStatus == ContractStatus.PF, "CONTRACT_NOT_PERFORMANT");

		uint256 eventId = assetRegistry.getEventId(contractId);

		(
			ContractState memory nextState, 
			ContractEvent[MAX_EVENT_SCHEDULE_SIZE] memory pendingEvents
		) = pamEngine.computeNextState(terms, state, timestamp);

		
		for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
			if (pendingEvents[i].scheduledTime == uint256(0)) { break; }
			uint256 payoff = (pendingEvents[i].payoff < 0) ? 
				uint256(pendingEvents[i].payoff * -1) : uint256(pendingEvents[i].payoff);
			if (payoff == uint256(0)) { continue; }
			require(paymentRegistry.getPayoffBalance(contractId, eventId) >= payoff, "OUTSTANDING_PAYMENTS");
			eventId += 1;
		}

		// check for non-payment events ...

		assetRegistry.setState(contractId, nextState);
		assetRegistry.setEventId(contractId, eventId);

		return(true);
	}

	function initialize(
		bytes32 contractId,
		ContractOwnership memory ownership, 
		ContractTerms memory terms
	) 
		public
		returns (bool)
	{
		ContractState memory initialState = pamEngine.computeInitialState(terms);

		ownershipRegistry.registerOwnership(
			contractId,
			ownership.recordCreatorObligor,
			ownership.recordCreatorBeneficiary,
			ownership.counterpartyObligor,
			ownership.counterpartyBeneficiary
		);

		assetRegistry.registerContract(
			contractId,
			terms,
			initialState,
			address(this)
		);

		return(true);
	}
}