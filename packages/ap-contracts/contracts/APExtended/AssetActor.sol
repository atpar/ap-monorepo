pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./IAssetActor.sol";
import "./IOwnershipRegistry.sol";
import "./IEconomicsRegistry.sol";
import "./IPaymentRegistry.sol";
import "./IPaymentRouter.sol";

import "../APCore/APDefinitions.sol";
import "../APEngines/IPAMEngine.sol";


contract AssetActor is APDefinitions, IAssetActor {

	IOwnershipRegistry ownershipRegistry;
	IEconomicsRegistry economicsRegistry;
	IPaymentRegistry paymentRegistry;
	IPaymentRouter paymentRouter;

	IPAMEngine pamEngine;


	constructor (
		IOwnershipRegistry _ownershipRegistry,
		IEconomicsRegistry _economicsRegistry,
		IPaymentRegistry _paymentRegistry,
		IPaymentRouter _paymentRouter,
		IPAMEngine _pamEngine
	)
		public
	{
		ownershipRegistry = _ownershipRegistry;
		economicsRegistry = _economicsRegistry;
		paymentRegistry = _paymentRegistry;
		paymentRouter = _paymentRouter;
		pamEngine = _pamEngine;
	}

	/**
	 * proceeds with the next state of the asset based on the terms, the last state and
	 * the status of all obligations, that are due to the specified timestamp. If all obligations are fullfilled
	 * the actor updates the state of the asset in the EconomicsRegistry
	 * @param assetId id of the asset
	 * @param timestamp current timestamp
	 * @return true if state was updated
	 */
	function progress(
		bytes32 assetId,
		uint256 timestamp
	)
		external
		returns (bool)
	{
		ContractTerms memory terms = economicsRegistry.getTerms(assetId);
		ContractState memory state = economicsRegistry.getState(assetId);

		require(terms.statusDate != uint256(0), "ENTRY_DOES_NOT_EXIST");
		require(state.lastEventTime != uint256(0), "ENTRY_DOES_NOT_EXIST");
		require(state.contractStatus == ContractStatus.PF, "CONTRACT_NOT_PERFORMANT");

		uint256 eventId = economicsRegistry.getEventId(assetId);

		(
			ContractState memory nextState,
			ContractEvent[MAX_EVENT_SCHEDULE_SIZE] memory pendingEvents
		) = pamEngine.computeNextState(terms, state, timestamp);


		for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
			if (pendingEvents[i].scheduledTime == uint256(0)) { break; }
			eventId += 1;
			uint256 payoff = (pendingEvents[i].payoff < 0) ?
				uint256(pendingEvents[i].payoff * -1) : uint256(pendingEvents[i].payoff);
			if (payoff == uint256(0)) { continue; }
			require(paymentRegistry.getPayoffBalance(assetId, eventId) >= payoff, "OUTSTANDING_PAYMENTS");
		}

		// check for non-payment events ...

		economicsRegistry.setState(assetId, nextState);
		economicsRegistry.setEventId(assetId, eventId);

		emit AssetProgressed(assetId, eventId);

		return(true);
	}

	/**
	 * derives the initial state of the asset from the provided terms and sets the initial state, the terms
	 * together with the ownership of the asset in the EconomicsRegistry and OwnershipRegistry
	 * @dev can only be called by the whitelisted account
	 * @param assetId id of the asset
	 * @param ownership ownership of the asset
	 * @param terms terms of the asset
	 * @return true on success
	 */
	function initialize(
		bytes32 assetId,
		AssetOwnership memory ownership,
		ContractTerms memory terms
	)
		public
		returns (bool)
	{
		ContractState memory initialState = pamEngine.computeInitialState(terms);

		ownershipRegistry.registerOwnership(
			assetId,
			ownership
		);

		economicsRegistry.registerEconomics(
			assetId,
			terms,
			initialState,
			address(this)
		);

		return(true);
	}
}