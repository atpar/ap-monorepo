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
	function progress(
		bytes32 assetId
	)
		external
		returns (bool)
	{
		ContractTerms memory terms = assetRegistry.getTerms(assetId);
		ContractState memory state = assetRegistry.getState(assetId);

		if (state.contractStatus != ContractStatus.PF) {
			state = assetRegistry.getFinalizedState(assetId);
		}

		require(
			terms.statusDate != uint256(0),
			"AssetActor.progress: ENTRY_DOES_NOT_EXIST"
		);
		require(
			state.lastEventTime != uint256(0),
			"AssetActor.progress: ENTRY_DOES_NOT_EXIST"
		);

		address engineAddress = assetRegistry.getEngineAddress(assetId);

		ProtoEvent[MAX_EVENT_SCHEDULE_SIZE] memory pendingProtoEvents = IEngine(engineAddress).computeProtoEventScheduleSegment(
			terms,
			shiftEventTime(state.lastEventTime, terms.businessDayConvention, terms.calendar),
			block.timestamp
		);

		for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
			if (pendingProtoEvents[i].eventTime == uint256(0)) { break; }

			bytes32 eventId = keccak256(
				abi.encode(
					pendingProtoEvents[i].eventType,
					pendingProtoEvents[i].eventTimeWithEpochOffset
				)
			);

			ContractEvent memory pendingEvent;
			(
				state,
				pendingEvent
			) = IEngine(engineAddress).computeNextStateForProtoEvent(
				terms,
				state,
				pendingProtoEvents[i],
				block.timestamp
			);
			uint256 payoff = (pendingEvent.payoff < 0) ?
				uint256(pendingEvent.payoff * -1) : uint256(pendingEvent.payoff);

			if (
				paymentRegistry.getPayoffBalance(assetId, eventId) < payoff
				&& state.contractStatus == ContractStatus.PF
			) {
				assetRegistry.setFinalizedState(assetId, state);

				(state, ) = IEngine(engineAddress).computeNextStateForProtoEvent(
					terms,
					state,
					createProtoEvent(
						EventType.DEL,
						pendingProtoEvents[i].scheduleTime,
						terms,
						EventType.DEL,
						EventType.DEL
					),
					block.timestamp
				);
			}
		}

		assetRegistry.setState(assetId, state);

		emit AssetProgressed(assetId);

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
		ContractTerms memory terms,
		address engineAddress
	)
		public
		// onlyRegisteredIssuer
		returns (bool)
	{
		ContractState memory initialState = IEngine(engineAddress).computeInitialState(terms);

		assetRegistry.registerAsset(
			assetId,
			ownership,
			terms,
			initialState,
			engineAddress,
			address(this)
		);

		return(true);
	}
}
