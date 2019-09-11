pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "actus-solidity/contracts/Core/Definitions.sol";
import "actus-solidity/contracts/Engines/IEngine.sol";

import "./SharedTypes.sol";
import "./IAssetActor.sol";
import "./AssetRegistry/IAssetRegistry.sol";
import "./IPaymentRegistry.sol";
import "./IPaymentRouter.sol";


contract AssetActor is SharedTypes, Definitions, IAssetActor, Ownable {

	IAssetRegistry assetRegistry;
	IPaymentRegistry paymentRegistry;
	IPaymentRouter paymentRouter;

  address[2] engineAddresses;
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
		IPaymentRouter _paymentRouter,
    address[2] memory  _engineAddresses
	)
		public
	{
		assetRegistry = _assetRegistry;
		paymentRegistry = _paymentRegistry;
		paymentRouter = _paymentRouter;
    engineAddresses = _engineAddresses;
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

		require(
			terms.statusDate != uint256(0),
			"AssetActor.progress: ENTRY_DOES_NOT_EXIST"
		);
		require(
			state.lastEventTime != uint256(0),
			"AssetActor.progress: ENTRY_DOES_NOT_EXIST"
		);
		require(
			state.contractStatus == ContractStatus.PF,
			"AssetActor.progress: CONTRACT_NOT_PERFORMANT"
		);

		uint256 eventId = assetRegistry.getEventId(assetId);

		(
			ContractState memory nextState,
			ContractEvent[MAX_EVENT_SCHEDULE_SIZE] memory pendingEvents
		) = IEngine(engineAddresses[uint256(terms.contractType)]).computeNextState(terms, state, block.timestamp);

		for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
			if (pendingEvents[i].eventTime == uint256(0)) { break; }
			eventId += 1;
			uint256 payoff = (pendingEvents[i].payoff < 0) ?
				uint256(pendingEvents[i].payoff * -1) : uint256(pendingEvents[i].payoff);
			if (payoff == uint256(0)) { continue; }
			require(
				paymentRegistry.getPayoffBalance(assetId, eventId) >= payoff,
				"AssetActor.progress: OUTSTANDING_PAYMENTS"
			);
		}

		// check for non-payment events ...

		assetRegistry.setState(assetId, nextState);
		assetRegistry.setEventId(assetId, eventId);

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
		// onlyRegisteredIssuer
		returns (bool)
	{
		ContractState memory initialState = IEngine(engineAddresses[uint256(terms.contractType)]).computeInitialState(terms);

		assetRegistry.registerAsset(
			assetId,
			ownership,
			terms,
			initialState,
			address(this)
		);

		return(true);
	}
}
