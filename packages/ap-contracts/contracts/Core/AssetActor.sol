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
import "./MarketObjectRegistry/IMarketObjectRegistry.sol";


contract AssetActor is SharedTypes, Core, IAssetActor, Ownable {

	IAssetRegistry assetRegistry;
	IProductRegistry productRegistry;
	IMarketObjectRegistry marketObjectRegistry;

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
		IProductRegistry _productRegistry,
		IMarketObjectRegistry _marketObjectRegistry
	)
		public
	{
		assetRegistry = _assetRegistry;
		productRegistry = _productRegistry;
		marketObjectRegistry = _marketObjectRegistry;
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
	 * the status of all obligations that are due
	 * @dev emit AssetProgressed if the state of the asset was updated
	 * @param assetId id of the asset
	 */
	function progress(bytes32 assetId) public {
		LifecycleTerms memory terms = assetRegistry.getTerms(assetId);
		State memory state = assetRegistry.getState(assetId);
		address engineAddress = assetRegistry.getEngineAddress(assetId);

		require(
			terms.statusDate != uint256(0) && state.statusDate != uint256(0) && engineAddress != address(0),
			"AssetActor.progress: ENTRY_DOES_NOT_EXIST"
		);

		require(
			state.contractPerformance != ContractPerformance.DF,
			"AssetActor.progress: ASSET_IS_IN_DEFAULT"
		);

		// get the next events event type and schedule time
		bytes32 _event = assetRegistry.getNextEvent(assetId);
		(EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

		// check if event is still scheduled under the current states of the asset and the underlying asset
		if (
			IEngine(engineAddress).isEventScheduled(
				_event,
				terms,
				state,
				(terms.contractStructure.object != bytes32(0)),
				assetRegistry.getState(terms.contractStructure.object)
			) == false
		) {
			// skip the event by incrementing the corresponding schedule index
			updateScheduleIndex(assetId, eventType);
			return;
		}

		// get external data
		bytes32 externalData = getExternalDataForEvent(_event, terms);
		// compute payoff and the next state by applying the event to the current state
		int256 payoff = IEngine(engineAddress).computePayoffForEvent(terms, state, _event, externalData);
		state = IEngine(engineAddress).computeStateForEvent(terms, state, _event, externalData);

		// try to settle payoff of event
		if (settlePayoffForEvent(assetId, _event, payoff, terms.currency)) {
			// if obligation is fulfilled increment the corresponding schedule index
			updateScheduleIndex(assetId, eventType);
		} else {
			// if the obligation can't be fulfilled and the performance changed from performant to DL, DQ or DF
			// store the interim state of the asset (state if the current obligation was successfully settled)
			// (if the obligation is later settled before the asset reaches default,
			// the interim state is used to derive subsequent states of the asset)
			if (state.contractPerformance == ContractPerformance.PF) {
				assetRegistry.setFinalizedState(assetId, state);
			}

			// create ceEvent
			bytes32 ceEvent = encodeEvent(EventType.CE, scheduleTime);

			// derive the actual state of the asset by applying the CreditEvent (updates performance of asset)
			state = IEngine(engineAddress).computeStateForEvent(
				terms,
				state,
				ceEvent,
				getExternalDataForEvent(ceEvent, terms)
			);
		}

		// store the resulting state
		assetRegistry.setState(assetId, state);

		emit AssetProgressed(assetId, eventType, scheduleTime);
	}

	/**
	 * derives the initial state of the asset from the provided custom terms and stores the initial state,
	 * the custom terms together with the ownership of the asset in the AssetRegistry
	 * @dev can only be called by a whitelisted issuer
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

		// compute the initial state of the asset using the LifecycleTerms
		State memory initialState = IEngine(engineAddress).computeInitialState(
			deriveLifecycleTerms(
				productRegistry.getProductTerms(productId),
				customTerms
			)
		);

		// register the asset in the AssetRegistry
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

		// return if there is no amount due
		if (payoff == 0) return true;

		AssetOwnership memory ownership = assetRegistry.getOwnership(assetId);

		// derive cashflowId to determine ownership of the cashflow
		(EventType eventType, ) = decodeEvent(_event);
		int8 cashflowId = (payoff > 0) ? int8(uint8(eventType) + 1) : int8(uint8(eventType) + 1) * -1;
		address payee = assetRegistry.getCashflowBeneficiary(assetId, cashflowId);

		// get the absolute of the payoff
		uint256 amount = (payoff > 0) ? uint256(payoff) : uint256(payoff * -1);

		// determine the payee of the payment by checking the sign of the payoff
		if (payoff > 0) {
			// only allow for the obligor to settle the payment
			if (msg.sender != ownership.counterpartyObligor) return false;
			// use the default beneficiary if the there is no specific owner of the cashflow
			if (payee == address(0)) {
				payee = ownership.creatorBeneficiary;
			}
		} else {
			// only allow for the obligor to settle the payment
			if (msg.sender != ownership.creatorObligor) return false;
			// use the default beneficiary if the there is no specific owner of the cashflow
			if (payee == address(0)) {
				payee = ownership.counterpartyBeneficiary;
			}
		}

		// try to transfer amount due from obligor to payee
		return IERC20(token).transferFrom(msg.sender, payee, amount);
	}

	function updateScheduleIndex(
		bytes32 assetId,
		EventType eventType
	)
		internal
	{
		// skip - for unscheduled events (e.g. CE, XD) there are no corresponding schedules
		if (isUnscheduledEventType(eventType)) return;

		// increment schedule index by deriving schedule index from the event type
		assetRegistry.incrementScheduleIndex(
			assetId,
			deriveScheduleIndexFromEventType(eventType)
		);
	}

	function getExternalDataForEvent(
		bytes32 _event,
		LifecycleTerms memory terms
	)
		internal
		returns (bytes32)
	{
		(EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

 		if (eventType == EventType.RR) {
			// get rate from MOR
			(int256 resetRate, bool isSet) = marketObjectRegistry.getDataPointOfMarketObject(
				terms.marketObjectCodeRateReset,
				scheduleTime
			);
			if (isSet) return bytes32(resetRate);
		} else if (eventType == EventType.CE) {
			return bytes32(block.timestamp);
		}

		return bytes32(0);
	}
}
