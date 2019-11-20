pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "actus-solidity/contracts/Core/Core.sol";
import "actus-solidity/contracts/Engines/IEngine.sol";

import "./SharedTypes.sol";
import "./IAssetActor.sol";
import "./AssetRegistry/IAssetRegistry.sol";
import "./ProductRegistry/IProductRegistry.sol";


contract AssetActor is SharedTypes, Core, IAssetActor, Ownable {

	IAssetRegistry assetRegistry;
	IProductRegistry productRegistry;

	mapping(address => bool) public issuers;


	modifier onlyRegisteredIssuer {
		require(
			issuers[msg.sender],
			"AssetActor.onlyRegisteredIssuer: UNAUTHORIZED_SENDER"
		);
		_;
	}

	constructor (IAssetRegistry _assetRegistry, IProductRegistry _productRegistry)
		public
	{
		assetRegistry = _assetRegistry;
		productRegistry = _productRegistry;
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
	 * the status of all obligations, that are due. If all obligations are fulfilled
	 * the actor updates the state of the asset in the AssetRegistry
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

		bytes32 _event = getNextEvent(assetId, terms);
		(EventType eventType, uint256 scheduleTime) = decodeEvent(_event);
		bytes32 eventId = keccak256(abi.encode(eventType, scheduleTime + getEpochOffset(eventType)));

		int256 payoff = IEngine(engineAddress).computePayoffForEvent(terms, state, _event, block.timestamp);
		state = IEngine(engineAddress).computeStateForEvent(terms, state, _event, block.timestamp);

		if (
			(settlePayoffForEvent(assetId, _event, payoff, terms.currency) == false)
			&& state.contractPerformance == ContractPerformance.PF
		) {
			assetRegistry.setFinalizedState(assetId, state);

			state = IEngine(engineAddress).computeStateForEvent(
				terms,
				state,
				encodeEvent(EventType.CE, scheduleTime),
				block.timestamp
			);
		}

		assetRegistry.setState(assetId, state);

		emit AssetProgressed(assetId, eventId, scheduleTime);
	}

	/**
	 * derives the initial state of the asset from the provided custom terms and sets the initial state, the terms
	 * together with the ownership of the asset in the AssetRegistry
	 * @dev can only be called by the whitelisted account
	 * @param assetId id of the asset
	 * @param ownership ownership of the asset
	 * @param productId id of the financial product to use
	 * @param customTerms asset specific terms
	 * @param engineAddress address of the ACTUS engine used for the spec. ContractType
	 * @return true on success
	 */
	function initialize(
		bytes32 assetId,
		AssetOwnership memory ownership,
		bytes32 productId,
		CustomTerms memory customTerms,
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

		// if anchorDate is not set, use block.timestamp
		if (customTerms.anchorDate == uint256(0)) {
			customTerms.anchorDate = block.timestamp;
		}

		State memory initialState = IEngine(engineAddress).computeInitialState(
			deriveLifecycleTerms(
				productRegistry.getProductTerms(productId),
				customTerms
			)
		);

		assetRegistry.registerAsset(
			assetId,
			ownership,
			productId,
			customTerms,
			initialState,
			engineAddress,
			address(this)
		);

		return true;
	}

	/**
	 * returns the next event
	 * @param assetId id of the asset
	 * @param terms terms of the asset
	 * @return event
	 */
	function getNextEvent(bytes32 assetId, LifecycleTerms memory terms)
		public
		view
		returns (bytes32)
	{
		bytes32 nextEvent;

		// non-cyclic Events
		nextEvent = assetRegistry.getNextNonCyclicEvent(assetId);
		(EventType nextEventType, uint256 nextScheduleTime) = decodeEvent(nextEvent);

		// IP / IPCI Events
		bytes32 nextIPEvent = assetRegistry.getNextCyclicEvent(assetId, EventType.IP);
		(EventType eventType, uint256 scheduleTime) = decodeEvent(nextIPEvent);
		if (
			(nextScheduleTime > scheduleTime && scheduleTime != uint256(0))
			|| (nextScheduleTime == scheduleTime && getEpochOffset(nextEventType) > getEpochOffset(eventType))
		) {
			nextEvent = nextIPEvent;
			nextScheduleTime = scheduleTime;
			nextEventType = eventType;
		}

		// PR Events
		bytes32 nextPREvent = assetRegistry.getNextCyclicEvent(assetId, EventType.PR);
		(eventType, scheduleTime) = decodeEvent(nextPREvent);
		if (
			(nextScheduleTime > scheduleTime && scheduleTime != uint256(0))
			|| (nextScheduleTime == scheduleTime && getEpochOffset(nextEventType) > getEpochOffset(eventType))
		) {
			nextEvent = nextPREvent;
			nextScheduleTime = scheduleTime;
			nextEventType = eventType;
		}

		// SC Events
		bytes32 nextSCEvent = assetRegistry.getNextCyclicEvent(assetId, EventType.SC);
		(eventType, scheduleTime) = decodeEvent(nextSCEvent);
		if (
			(nextScheduleTime > scheduleTime && scheduleTime != uint256(0))
			|| (nextScheduleTime == scheduleTime && getEpochOffset(nextEventType) > getEpochOffset(eventType))
		) {
			nextEvent = nextSCEvent;
			nextScheduleTime = scheduleTime;
			nextEventType = eventType;
		}

		// RR Events
		bytes32 nextRREvent = assetRegistry.getNextCyclicEvent(assetId, EventType.RR);
		(eventType, scheduleTime) = decodeEvent(nextRREvent);
		if (
			(nextScheduleTime > scheduleTime && scheduleTime != uint256(0))
			|| (nextScheduleTime == scheduleTime && getEpochOffset(nextEventType) > getEpochOffset(eventType))
		) {
			nextEvent = nextRREvent;
			nextScheduleTime = scheduleTime;
			nextEventType = eventType;
		}

		// PY Events
		bytes32 nextPYEvent = assetRegistry.getNextCyclicEvent(assetId, EventType.PY);
		(eventType, scheduleTime) = decodeEvent(nextPYEvent);
		if (
			(nextScheduleTime > scheduleTime && scheduleTime != uint256(0))
			|| (nextScheduleTime == scheduleTime && getEpochOffset(nextEventType) > getEpochOffset(eventType))
		) {
			nextEvent = nextPYEvent;
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
				"AssetActor.getNextEvent: ENTRY_DOES_NOT_EXIST"
			);

			if (underlyingState.contractPerformance == terms.creditEventTypeCovered) {
				if (underlyingState.contractPerformance == ContractPerformance.DL) {
					nextScheduleTime = underlyingState.nonPerformingDate;
				} else if (underlyingState.contractPerformance == ContractPerformance.DQ) {
					nextScheduleTime = getTimestampPlusPeriod(underlyingTerms.gracePeriod, underlyingState.nonPerformingDate);
				} else if (underlyingState.contractPerformance == ContractPerformance.DF) {
					nextScheduleTime = getTimestampPlusPeriod(underlyingTerms.delinquencyPeriod, underlyingState.nonPerformingDate);
				}

				nextEvent = encodeEvent(EventType.XD, nextScheduleTime);
			}
		}

		return nextEvent;
	}

	/**
	 * routes a payment to the designated beneficiary
	 * @dev checks if an owner of the specified cashflowId is set,
	 * if not it sends funds to the default beneficiary
	 * @param assetId id of the asset which the payment relates to
	 * @param _event _event to settle the payoff for
	 * @param payoff payoff of the event
	 * @param token address of the token to transfer
	 */
	function settlePayoffForEvent(
		bytes32 assetId,
		bytes32 _event,
		int256 payoff,
		address token
	)
		internal
		returns (bool)
	{
		require(
			assetId != bytes32(0) && _event != bytes32(0) && token != address(0),
			"AssetActor.settlePayoffForEvent: INVALID_FUNCTION_PARAMETERS"
		);

		if (payoff == 0) {
			return true;
		}

		(EventType eventType, ) = decodeEvent(_event);
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
