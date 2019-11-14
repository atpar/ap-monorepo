pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "actus-solidity/contracts/Core/Core.sol";
import "actus-solidity/contracts/Engines/IEngine.sol";

import "./SharedTypes.sol";
import "./PaymentRouter.sol";
import "./IAssetActor.sol";
import "./AssetRegistry/IAssetRegistry.sol";


contract AssetActor is SharedTypes, Core, IAssetActor, Ownable {

	IAssetRegistry assetRegistry;

	mapping(address => bool) public issuers;


	modifier onlyRegisteredIssuer {
		require(
			issuers[msg.sender],
			"AssetActor.onlyRegisteredIssuer: UNAUTHORIZED_SENDER"
		);
		_;
	}

	constructor (IAssetRegistry _assetRegistry)
		public
	{
		assetRegistry = _assetRegistry;
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
	{
		LifecycleTerms memory terms = assetRegistry.getTerms(assetId);
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

		if (
			(settlePayoffForProtoEvent(assetId, protoEvent, payoff, terms.currency) == false)
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
		LifecycleTerms memory terms,
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

		return true;
	}

	/**
	 * returns the next ProtoEvent
	 * @param assetId id of the asset
	 * @param terms terms of the asset
	 * @return ProtoEvent
	 */
	function getNextProtoEvent(
		bytes32 assetId,
		LifecycleTerms memory terms
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
			LifecycleTerms memory underlyingTerms = assetRegistry.getTerms(underlyingAssetId);

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

	/**
	 * routes a payment to the designated beneficiary and
	 * registers that the payment was made in the payment registry
	 * @dev checks if an owner of the specified cashflowId is set,
	 * if not it sends funds to the default beneficiary
	 * @param assetId id of the asset which the payment relates to
	 * @param protoEvent protoEvent to settle the payoff for
	 * @param payoff payoff of the ProtoEvent
	 * @param token address of the token to transfer
	 */
	function settlePayoffForProtoEvent(
		bytes32 assetId,
		bytes32 protoEvent,
		int256 payoff,
		address token
	)
		internal
		returns (bool)
	{
		require(
			assetId != bytes32(0) && protoEvent != bytes32(0) && token != address(0),
			"AssetActor.settlePayoffForProtoEvent: INVALID_FUNCTION_PARAMETERS"
		);

		if (payoff == 0) {
			return true;
		}

		(EventType eventType, ) = decodeProtoEvent(protoEvent);
		int8 cashflowId = (payoff > 0) ? int8(uint8(eventType) + 1) : int8(uint8(eventType) + 1) * -1;
		address payee = assetRegistry.getCashflowBeneficiary(assetId, cashflowId);
		uint256 amount = (payoff > 0) ? uint256(payoff) : uint256(payoff * -1);
		AssetOwnership memory ownership = assetRegistry.getOwnership(assetId);

		if (payoff > 0) {
			if (msg.sender != ownership.counterpartyObligor) {
				return false;
			}
			if (payee == address(0)) {
				payee = ownership.recordCreatorBeneficiary;
			}
		} else {
			if (msg.sender != ownership.recordCreatorObligor) {
				return false;
			}
			if (payee == address(0)) {
				payee = ownership.counterpartyBeneficiary;
			}
		}

		return IERC20(token).transferFrom(msg.sender, payee, amount);
	}
}
