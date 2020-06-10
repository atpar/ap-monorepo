pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "@atpar/actus-solidity/contracts/Core/Utils.sol";
import "@atpar/actus-solidity/contracts/Engines/IEngine.sol";

import "../SharedTypes.sol";
import "../ScheduleUtils.sol";
import "../Conversions.sol";
import "../AssetRegistry/IAssetRegistry.sol";
import "../TemplateRegistry/ITemplateRegistry.sol";
import "../MarketObjectRegistry/IMarketObjectRegistry.sol";
import "./IAssetActor.sol";


/**
 * @title AssetActor
 * @notice As the centerpiece of the ACTUS Protocol it is responsible for managing the
 * lifecycle of assets registered through the AssetRegistry. It acts as the executive of AP
 * by initializing the state of the asset and by processing the assets schedule as specified
 * in the TemplateRegistry. It derives the next state and the current outstanding payoff of
 * the asset by submitting the last finalized state to the corresponding ACTUS Engine.
 * The AssetActor stores the next state in the AssetRegistry, depending on if it is able
 * to settle the current outstanding payoff on behalf of the obligor.
 */
contract AssetActor is
    Utils,
    ScheduleUtils,
    Conversions,
    IAssetActor,
    Ownable
{

    event ProgressedAsset(bytes32 indexed assetId, EventType eventType, uint256 scheduleTime, int256 payoff);
    event Status(bytes32 indexed assetId, bytes32 statusMessage);


    IAssetRegistry public assetRegistry;
    ITemplateRegistry public templateRegistry;
    IMarketObjectRegistry public marketObjectRegistry;

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
        ITemplateRegistry _templateRegistry,
        IMarketObjectRegistry _marketObjectRegistry
    )
        public
    {
        assetRegistry = _assetRegistry;
        templateRegistry = _templateRegistry;
        marketObjectRegistry = _marketObjectRegistry;
    }

    /**
     * @notice Whitelists the address of an issuer contract for initializing an asset.
     * @dev Can only be called by the owner of the contract.
     * @param issuer address of the issuer
     */
    function registerIssuer(address issuer) external onlyOwner {
        issuers[issuer] = true;
    }

    /**
     * @notice Proceeds with the next state of the asset based on the terms, the last state, market object data
     * and the settlement status of current obligation, derived from either a prev. pending event, an event
     * generated based on the current state of an underlying asset or the assets schedule.
     * @dev Emits ProgressedAsset if the state of the asset was updated.
     * @param assetId id of the asset
     */
    function progress(bytes32 assetId) external override {
        // revert if the asset is not registered in the AssetRegistry
        require(
            assetRegistry.isRegistered(assetId),
            "AssetActor.progress: ASSET_DOES_NOT_EXIST"
        );

        // enforce order:
        // - 1. pending event has to be processed
        // - 2. an event which was generated based on the state of the underlying asset
        // - 3. the next event in the schedule
        bytes32 _event = assetRegistry.popPendingEvent(assetId);
        if (_event == bytes32(0)) _event = assetRegistry.getNextUnderlyingEvent(assetId);
        if (_event == bytes32(0)) _event = assetRegistry.popNextScheduledEvent(assetId);

        // e.g. if all events in the schedule are processed
        require(
            _event != bytes32(0),
            "AssetActor.progress: NO_NEXT_EVENT"
        );

        processEvent(assetId, _event);
    }

    /**
     * @notice Proceeds with the next state of the asset based on the terms, the last state, market object data
     * and the settlement status of current obligation, derived from a provided (unscheduled) event
     * Reverts if the provided event violates the order of events.
     * @dev Emits ProgressedAsset if the state of the asset was updated.
     * @param assetId id of the asset
     * @param _event the unscheduled event
     */
    function progressWith(bytes32 assetId, bytes32 _event) external override {
        // revert if msg.sender is not authorized to update the asset
        require(
            assetRegistry.hasRootAccess(assetId, msg.sender),
            "AssetActor.progressWith: UNAUTHORIZED_SENDER"
        );

        // enforce order:
        // - 1. pending event has to be processed
        // - 2. an event which was generated based on the state of the underlying asset
        require(
            assetRegistry.getPendingEvent(assetId) == bytes32(0),
            "AssetActor.progressWith: FOUND_PENDING_EVENT"
        );
        require(
            assetRegistry.getNextUnderlyingEvent(assetId) == bytes32(0),
            "AssetActor.progressWith: FOUND_UNDERLYING_EVENT"
        );

        // - 3. the scheduled event takes priority if its schedule time is early or equal to the provided event
        (, uint256 scheduledEventScheduleTime) = decodeEvent(assetRegistry.getNextScheduledEvent(assetId));
        (, uint256 providedEventScheduleTime) = decodeEvent(_event);
        require(
            scheduledEventScheduleTime == 0 || (providedEventScheduleTime < scheduledEventScheduleTime),
            "AssetActor.progressWith: FOUND_EARLIER_EVENT"
        );

        processEvent(assetId, _event);
    }

    /**
     * @notice Derives the initial state of the asset from the provided custom terms and
     * stores the initial state, the custom terms together with the ownership of the asset
     * in the AssetRegistry.
     * @dev Can only be called by a whitelisted issuer.
     * (has to be public otherwise compilation error.)
     * @param assetId id of the asset
     * @param ownership ownership of the asset
     * @param terms asset specific terms
     * @param engine address of the ACTUS engine used for the spec. ContractType
     * @param admin address of the admin of the asset (optional)
     * @return true on success
     */
    function initialize(
        bytes32 assetId,
        AssetOwnership memory ownership,
        PAMTerms memory terms,
        address engine,
        address admin
    )
        public
        onlyRegisteredIssuer
        override
        returns (bool)
    {
        require(
            assetId != bytes32(0) && engine != address(0),
            "AssetActor.initialize: INVALID_FUNCTION_PARAMETERS"
        );

        // compute the initial state of the asset using PAMTerms
        State memory initialState = IPAMEngine(engine).computeInitialState(terms);

        // register the asset in the AssetRegistry
        assetRegistry.registerAsset(
            assetId,
            ownership,
            terms,
            initialState,
            engine,
            address(this),
            admin
        );

        return true;
    }

    /**
     * @notice Return true if event was settled
     */
    function processEvent(bytes32 assetId, bytes32 _event) internal {
        State memory state = assetRegistry.getState(assetId);

        // block progression if asset is has defaulted, terminated or reached maturity
        require(
            state.contractPerformance == ContractPerformance.PF
            || state.contractPerformance == ContractPerformance.DL
            || state.contractPerformance == ContractPerformance.DQ,
            "AssetActor.processEvent: ASSET_REACHED_FINAL_STATE"
        );

        // get finalized state if asset is not performant
        if (state.contractPerformance != ContractPerformance.PF) {
            state = assetRegistry.getFinalizedState(assetId);
        }

        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        // revert if the scheduleTime of the next event is in the future
        require(
            // solium-disable-next-line
            scheduleTime <= block.timestamp,
            "AssetActor.processEvent: NEXT_EVENT_NOT_YET_SCHEDULED"
        );

        // get external data for the next event
        // compute payoff and the next state by applying the event to the current state
        (State memory nextState, int256 payoff) = computeStateAndPayoffForEvent(assetId, state, _event);

        // try to settle payoff of event
        bool settledPayoff = settlePayoffForEvent(assetId, _event, payoff, token);

        if (settledPayoff == false) {
            // if the obligation can't be fulfilled and the performance changed from performant to DL, DQ or DF,
            // store the last performant state of the asset
            // (if the obligation is later fulfilled before the asset reaches default,
            // the last performant state is used to derive subsequent states of the asset)
            if (state.contractPerformance == ContractPerformance.PF) {
                assetRegistry.setFinalizedState(assetId, state);
            }

            // store event as pending event for future settlement
            assetRegistry.pushPendingEvent(assetId, _event);

            // create CreditEvent
            bytes32 ceEvent = encodeEvent(EventType.CE, scheduleTime);

            // derive the actual state of the asset by applying the CreditEvent (updates performance of asset)
            (nextState, ) = computeStateAndPayoffForEvent(assetId, nextState, ceEvent);
        }

        // store the resulting state
        assetRegistry.setState(assetId, nextState);

        // mark event as settled
        if (settledPayoff == true) {
            assetRegistry.markEventAsSettled(assetId, _event, payoff);
        }

        emit ProgressedAsset(
            assetId,
            // if settlement failed a CreditEvent got processed instead
            (settledPayoff == true) ? eventType : EventType.CE,
            scheduleTime,
            payoff
        );
    }

    /**
     * @notice Routes a payment to the designated beneficiary of the event obligation.
     * @dev Checks if an owner of the specified cashflowId is set, if not it sends
     * funds to the default beneficiary.
     * @param assetId id of the asset which the payment relates to
     * @param _event _event to settle the payoff for
     * @param payoff payoff of the event
     * @param terms terms of the asset
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
            assetId != bytes32(0) && _event != bytes32(0),
            "AssetActor.settlePayoffForEvent: INVALID_FUNCTION_PARAMETERS"
        );

        // return if there is no amount due
        if (payoff == 0) return true;

        // get the token address either from currency attribute or from the second contract reference
        address token = terms.currency;
        if (terms.contractReference_2.role == ContractReferenceRole.COVI) {
            (token, ) = decodeCollateralObject(terms.contractReference_2.object);
        }

        AssetOwnership memory ownership = assetRegistry.getOwnership(assetId);

        // derive cashflowId to determine ownership of the cashflow
        (EventType eventType, ) = decodeEvent(_event);
        int8 cashflowId = (payoff > 0) ? int8(uint8(eventType) + 1) : int8(uint8(eventType) + 1) * -1;
        address payee = assetRegistry.getCashflowBeneficiary(assetId, cashflowId);
        address payer;

        // determine the payee and payer of the payment by checking the sign of the payoff
        if (payoff > 0) {
            // only allow for the obligor to settle the payment
            payer = ownership.counterpartyObligor;
            // use the default beneficiary if the there is no specific owner of the cashflow
            if (payee == address(0)) {
                payee = ownership.creatorBeneficiary;
            }
        } else {
            // only allow for the obligor to settle the payment
            payer = ownership.creatorObligor;
            // use the default beneficiary if the there is no specific owner of the cashflow
            if (payee == address(0)) {
                payee = ownership.counterpartyBeneficiary;
            }
        }

        // calculate the magnitude of the payoff
        uint256 amount = (payoff > 0) ? uint256(payoff) : uint256(payoff * -1);

        // check if allowance is set by the payer for the Asset Actor and that payer is able to cover payment
        if (IERC20(token).allowance(payer, address(this)) < amount || IERC20(token).balanceOf(payer) < amount) {
            emit Status(assetId, "INSUFFICIENT_FUNDS");
            return false;
        }

        // try to transfer amount due from obligor to payee
        return IERC20(token).transferFrom(payer, payee, amount);
    }

    function computeStateAndPayoffForEvent(bytes32 assetId, State memory state, bytes32 _event)
        internal
        returns (State memory, int256)
    {
        address engineAddress = assetRegistry.getEngine(assetId);
        ContractType contractType = IEngine(engineAddress).contractType();

        if (contractType == ContractType.PAM) {
            PAMTerms memory terms = assetRegistry.getPAMTerms(assetId);

            int256 payoff = IPAMEngine(engineAddress).computePayoffForEvent(
                terms,
                state,
                _event,
                getExternalDataForPOF(_event, terms)
            );
            state = IPAMEngine(engineAddress).computeStateForEvent(
                terms,
                state,
                _event,
                getExternalDataForSTF(_event, terms)
            );

            return (state, payoff);
        }

        revert("AssetActor.computePayoffAndStateForEvent: UNSUPPORTED_CONTRACT_TYPE");
    }

    /**
     * @notice Retrieves external data (such as market object data, block time, underlying asset state)
     * used for evaluating the STF for a given event.
     */
    function getExternalDataForSTF(
        bytes32 _event,
        LifecycleTerms memory terms
    )
        internal
        view
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
            // get current timestamp
            // solium-disable-next-line
            return bytes32(block.timestamp);
        } else if (eventType == EventType.XD) {
            // get the remaining notionalPrincipal from the underlying
            if (terms.contractReference_1.role == ContractReferenceRole.COVE) {
                State memory underlyingState = assetRegistry.getState(terms.contractReference_1.object);
                return bytes32(underlyingState.notionalPrincipal);
            }
        }

        return bytes32(0);
    }

    /**
     * @notice Retrieves external data (such as market object data)
     * used for evaluating the POF for a given event.
     */
    function getExternalDataForPOF(
        bytes32 _event,
        LifecycleTerms memory terms
    )
        internal
        view
        returns (bytes32)
    {
        (, uint256  scheduleTime) = decodeEvent(_event);

        if (terms.currency != terms.settlementCurrency) {
            // get FX rate
            (int256 fxRate, bool isSet) = marketObjectRegistry.getDataPointOfMarketObject(
                keccak256(abi.encode(terms.currency, terms.settlementCurrency)),
                scheduleTime
            );
            if (isSet) return bytes32(fxRate);
        }
    }
}
