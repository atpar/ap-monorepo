pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "actus-solidity/contracts/Core/Core.sol";
import "actus-solidity/contracts/Engines/IEngine.sol";

import "./SharedTypes.sol";
import "./IAssetActor.sol";
import "./AssetRegistry/IAssetRegistry.sol";
import "./IPaymentRegistry.sol";
import "./IPaymentRouter.sol";


contract AssetActor is SharedTypes, Core, IAssetActor, Ownable {

	IAssetRegistry assetRegistry;
	IPaymentRegistry paymentRegistry;
	IPaymentRouter paymentRouter;

	mapping(address => bool) public issuers;


	modifier onlyRegisteredIssuer {
		require(
			issuers[msg.sender],
			"AssetActor.onlyRegisteredIssuer: UNAUTHORIZED_SENDER"
		);
		_;
	}

	constructor (
		IAssetRegistry _assetRegistry,
		IPaymentRegistry _paymentRegistry,
		IPaymentRouter _paymentRouter
	)
		public
	{
		assetRegistry = _assetRegistry;
		paymentRegistry = _paymentRegistry;
		paymentRouter = _paymentRouter;
	}

	/**
	 * whitelists the address of an issuer contract for initializing an asset
	 * @dev can only be called by the owner of the contract
	 * @param issuer address of the issuer
	 */
	function registerIssuer(address issuer) external onlyOwner {
		issuers[issuer] = true;
	}

	/**
	 * proceeds with the next state of the asset based on the terms, the last state and
	 * the status of all obligations, that are due. If all obligations are fullfilled
	 * the actor updates the state of the asset in the EconomicsRegistry
	 * @param assetId id of the asset
	 * @return true if state was updated
	 */
	function progress(bytes32 assetId)
		public
		returns(bool)
	{
		Terms memory terms = assetRegistry.getTerms(assetId);
		State memory state = assetRegistry.getState(assetId);
		address engineAddress = assetRegistry.getEngineAddress(assetId);

		require(
			terms.statusDate != uint256(0) && state.lastEventTime != uint256(0) && engineAddress != address(0),
			"AssetActor.progress: ENTRY_DOES_NOT_EXIST"
		);

		bytes32 protoEvent = getNextProtoEvent(assetId, terms);
		(EventType eventType, uint256 scheduleTime) = decodeProtoEvent(protoEvent);
		bytes32 eventId = keccak256(abi.encode(eventType, scheduleTime + getEpochOffset(eventType)));

		int256 payoff = IEngine(engineAddress).computePayoffForProtoEvent(terms, state, protoEvent, block.timestamp);
		state = IEngine(engineAddress).computeStateForProtoEvent(terms, state, protoEvent, block.timestamp);

		// evaluate fulfillment of obligaitons
		if (
			paymentRegistry.getPayoffBalance(assetId, eventId) < ((payoff < 0) ? uint256(payoff * -1) : uint256(payoff))
			&& state.contractPerformance == ContractPerformance.PF
		) {
			assetRegistry.setFinalizedState(assetId, state);

			state = IEngine(engineAddress).computeStateForProtoEvent(
				terms,
				state,
				encodeProtoEvent(EventType.DEL, scheduleTime),
				block.timestamp
			);
		}

		assetRegistry.setState(assetId, state);

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
	 * @param engineAddress address of the ACTUS engine used for the spec. ContractType
	 * @return true on success
	 */
	function initialize(
		bytes32 assetId,
		AssetOwnership memory ownership,
		Terms memory terms,
		ProtoEventSchedules memory protoEventSchedules,
		address engineAddress
	)
		public
		// onlyRegisteredIssuer
		returns (bool)
	{
		require(
			assetId != bytes32(0) && engineAddress != address(0),
			"AssetActor.initialize: INVALID_FUNCTION_PARAMETERS"
		);

		State memory initialState = IEngine(engineAddress).computeInitialState(terms);

		assetRegistry.registerAsset(
			assetId,
			ownership,
			terms,
			initialState,
			protoEventSchedules,
			engineAddress,
			address(this)
		);

		return(true);
	}

	/**
	 * returns the next ProtoEvent
	 * @param assetId id of the asset
	 * @param terms terms of the asset
	 * @return ProtoEvent
	 */
	function getNextProtoEvent(
		bytes32 assetId,
		Terms memory terms
	)
		public
		view
		returns (bytes32)
	{
		bytes32 nextProtoEvent;

		// non-cyclic ProtoEvents
		nextProtoEvent = assetRegistry.getNextNonCyclicProtoEvent(assetId);
		(EventType nextEventType, uint256 nextScheduleTime) = decodeProtoEvent(nextProtoEvent);

		// IP / IPCI ProtoEvents
		bytes32 nextIPProtoEvent = assetRegistry.getNextCyclicProtoEvent(assetId, EventType.IP);
		(EventType eventType, uint256 scheduleTime) = decodeProtoEvent(nextIPProtoEvent);
		if (
			(nextScheduleTime > scheduleTime && scheduleTime != uint256(0))
			|| (nextScheduleTime == scheduleTime && getEpochOffset(nextEventType) > getEpochOffset(eventType))
		) {
			nextProtoEvent = nextIPProtoEvent;
			nextScheduleTime = scheduleTime;
			nextEventType = eventType;
		}

		// PR ProtoEvents
		bytes32 nextPRProtoEvent = assetRegistry.getNextCyclicProtoEvent(assetId, EventType.PR);
		(eventType, scheduleTime) = decodeProtoEvent(nextPRProtoEvent);
		if (
			(nextScheduleTime > scheduleTime && scheduleTime != uint256(0))
			|| (nextScheduleTime == scheduleTime && getEpochOffset(nextEventType) > getEpochOffset(eventType))
		) {
			nextProtoEvent = nextPRProtoEvent;
			nextScheduleTime = scheduleTime;
			nextEventType = eventType;
		}

		// SC ProtoEvents
		bytes32 nextSCProtoEvent = assetRegistry.getNextCyclicProtoEvent(assetId, EventType.SC);
		(eventType, scheduleTime) = decodeProtoEvent(nextSCProtoEvent);
		if (
			(nextScheduleTime > scheduleTime && scheduleTime != uint256(0))
			|| (nextScheduleTime == scheduleTime && getEpochOffset(nextEventType) > getEpochOffset(eventType))
		) {
			nextProtoEvent = nextSCProtoEvent;
			nextScheduleTime = scheduleTime;
			nextEventType = eventType;
		}

		// RR ProtoEvents
		bytes32 nextRRProtoEvent = assetRegistry.getNextCyclicProtoEvent(assetId, EventType.RR);
		(eventType, scheduleTime) = decodeProtoEvent(nextRRProtoEvent);
		if (
			(nextScheduleTime > scheduleTime && scheduleTime != uint256(0))
			|| (nextScheduleTime == scheduleTime && getEpochOffset(nextEventType) > getEpochOffset(eventType))
		) {
			nextProtoEvent = nextRRProtoEvent;
			nextScheduleTime = scheduleTime;
			nextEventType = eventType;
		}

		// PY ProtoEvents
		bytes32 nextPYProtoEvent = assetRegistry.getNextCyclicProtoEvent(assetId, EventType.PY);
		(eventType, scheduleTime) = decodeProtoEvent(nextPYProtoEvent);
		if (
			(nextScheduleTime > scheduleTime && scheduleTime != uint256(0))
			|| (nextScheduleTime == scheduleTime && getEpochOffset(nextEventType) > getEpochOffset(eventType))
		) {
			nextProtoEvent = nextPYProtoEvent;
			nextScheduleTime = scheduleTime;
			nextEventType = eventType;
		}

		// Underlying
		bytes32 underlyingAssetId = terms.contractStructure.object;
		if (underlyingAssetId != bytes32(0)) {
			State memory underlyingState = assetRegistry.getState(underlyingAssetId);
			Terms memory underlyingTerms = assetRegistry.getTerms(underlyingAssetId);

			require(
				underlyingState.lastEventTime != uint256(0),
				"AssetActor.getNextProtoEvent: ENTRY_DOES_NOT_EXIST"
			);

			if (underlyingState.contractPerformance == terms.creditEventTypeCovered) {
				if (underlyingState.contractPerformance == ContractPerformance.DL) {
					nextScheduleTime = underlyingState.nonPerformingDate;
				} else if (underlyingState.contractPerformance == ContractPerformance.DQ) {
					nextScheduleTime = getTimestampPlusPeriod(underlyingTerms.gracePeriod, underlyingState.nonPerformingDate);
				} else if (underlyingState.contractPerformance == ContractPerformance.DF) {
					nextScheduleTime = getTimestampPlusPeriod(underlyingTerms.delinquencyPeriod, underlyingState.nonPerformingDate);
				}

				nextProtoEvent = encodeProtoEvent(EventType.XD, nextScheduleTime);
			}
		}

		return nextProtoEvent;
	}
}
