// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "@atpar/actus-solidity/contracts/Core/Utils.sol";

import "../SharedTypes.sol";
import "../ScheduleUtils.sol";
import "../Conversions.sol";
import "../AssetRegistry/IAssetRegistry.sol";
import "../MarketObjectRegistry/IMarketObjectRegistry.sol";
import "./IAssetActor.sol";


/**
 * @title BaseActor
 * @notice As the centerpiece of the ACTUS Protocol it is responsible for managing the
 * lifecycle of assets registered through the AssetRegistry. It acts as the executive of AP
 * by initializing the state of the asset and by processing the assets schedule as specified
 * in the TemplateRegistry. It derives the next state and the current outstanding payoff of
 * the asset by submitting the last finalized state to the corresponding ACTUS Engine.
 * The AssetActor stores the next state in the AssetRegistry, depending on if it is able
 * to settle the current outstanding payoff on behalf of the obligor.
 */
abstract contract BaseActor is
    Utils,
    ScheduleUtils,
    Conversions,
    IAssetActor,
    Ownable
{

    event InitializedAsset(bytes32 indexed assetId, ContractType contractType, address creator, address counterparty);
    event ProgressedAsset(bytes32 indexed assetId, EventType eventType, uint256 scheduleTime, int256 payoff);
    event Status(bytes32 indexed assetId, bytes32 statusMessage);


    IAssetRegistry public assetRegistry;
    IMarketObjectRegistry public marketObjectRegistry;

    mapping(address => bool) public issuers;


    modifier onlyRegisteredIssuer {
        require(
            issuers[msg.sender],
            "BaseActor.onlyRegisteredIssuer: UNAUTHORIZED_SENDER"
        );
        _;
    }

    constructor (
        IAssetRegistry _assetRegistry,
        IMarketObjectRegistry _marketObjectRegistry
    )
        public
    {
        assetRegistry = _assetRegistry;
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
            "BaseActor.progress: ASSET_DOES_NOT_EXIST"
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
            "BaseActor.progress: NO_NEXT_EVENT"
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
            "BaseActor.progressWith: UNAUTHORIZED_SENDER"
        );

        // enforce order:
        // - 1. pending event has to be processed
        // - 2. an event which was generated based on the state of the underlying asset
        require(
            assetRegistry.getPendingEvent(assetId) == bytes32(0),
            "BaseActor.progressWith: FOUND_PENDING_EVENT"
        );
        require(
            assetRegistry.getNextUnderlyingEvent(assetId) == bytes32(0),
            "BaseActor.progressWith: FOUND_UNDERLYING_EVENT"
        );

        // - 3. the scheduled event takes priority if its schedule time is early or equal to the provided event
        (, uint256 scheduledEventScheduleTime) = decodeEvent(assetRegistry.getNextScheduledEvent(assetId));
        (, uint256 providedEventScheduleTime) = decodeEvent(_event);
        require(
            scheduledEventScheduleTime == 0 || (providedEventScheduleTime < scheduledEventScheduleTime),
            "BaseActor.progressWith: FOUND_EARLIER_EVENT"
        );

        processEvent(assetId, _event);
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
            "BaseActor.processEvent: ASSET_REACHED_FINAL_STATE"
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
            "BaseActor.processEvent: NEXT_EVENT_NOT_YET_SCHEDULED"
        );

        // get external data for the next event
        // compute payoff and the next state by applying the event to the current state
        (State memory nextState, int256 payoff) = computeStateAndPayoffForEvent(assetId, state, _event);

        // try to settle payoff of event
        bool settledPayoff = settlePayoffForEvent(assetId, _event, payoff);

        if (settledPayoff == false) {
            // if the obligation can't be fulfilled and the performance changed from performant to DL, DQ or DF,
            // store the last performant state of the asset
            // (if the obligation is later fulfilled before the asset reaches default,
            // the last performant state is used to derive subsequent states of the asset)
            if (state.contractPerformance == ContractPerformance.PF) {
                assetRegistry.setFinalizedState(assetId, nextState); // state ???
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
     */
    function settlePayoffForEvent(
        bytes32 assetId,
        bytes32 _event,
        int256 payoff
    )
        internal
        returns (bool)
    {
        require(
            assetId != bytes32(0) && _event != bytes32(0),
            "BaseActor.settlePayoffForEvent: INVALID_FUNCTION_PARAMETERS"
        );

        // return if there is no amount due
        if (payoff == 0) return true;

        // get the token address either from currency attribute or from the second contract reference
        address token = assetRegistry.getAddressValueForTermsAttribute(assetId, "currency");
        ContractReference memory contractReference_2 = assetRegistry.getContractReferenceValueForTermsAttribute(
            assetId,
            "contractReference_2"
        );
        if (contractReference_2.role == ContractReferenceRole.COVI) {
            (token, ) = decodeCollateralObject(contractReference_2.object);
        }

        AssetOwnership memory ownership = assetRegistry.getOwnership(assetId);

        // determine the payee and payer of the payment by checking the sign of the payoff
        address payee;
        address payer;
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
        view
        virtual
        returns (State memory, int256);

    /**
     * @notice Retrieves external data (such as market object data, block time, underlying asset state)
     * used for evaluating the STF for a given event.
     */
    function getExternalDataForSTF(
        bytes32 assetId,
        bytes32 _event
    )
        internal
        view
        returns (bytes32)
    {
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        if (eventType == EventType.RR) {
            // get rate from MOR
            (int256 resetRate, bool isSet) = marketObjectRegistry.getDataPointOfMarketObject(
                assetRegistry.getBytes32ValueForTermsAttribute(assetId, "marketObjectCodeRateReset"),
                scheduleTime
            );
            if (isSet) return bytes32(resetRate);
        } else if (eventType == EventType.CE) {
            // get current timestamp
            // solium-disable-next-line
            return bytes32(block.timestamp);
        } else if (eventType == EventType.XD) {
            // get the remaining notionalPrincipal from the underlying
            ContractReference memory contractReference_1 = assetRegistry.getContractReferenceValueForTermsAttribute(
                assetId,
                "contractReference_1"
            );
            if (contractReference_1.role == ContractReferenceRole.COVE) {
                bytes32 underlyingAssetId = contractReference_1.object;
                address underlyingRegistry = address(uint160(uint256(contractReference_1.object2)));
                require(
                    IAssetRegistry(underlyingRegistry).isRegistered(underlyingAssetId) == true,
                    "BaseActor.getExternalDataForSTF: ASSET_DOES_NOT_EXIST"
                );
                return bytes32(
                    IAssetRegistry(underlyingRegistry).getIntValueForStateAttribute(underlyingAssetId, "notionalPrincipal")
                );
            }
        }

        return bytes32(0);
    }

    /**
     * @notice Retrieves external data (such as market object data)
     * used for evaluating the POF for a given event.
     */
    function getExternalDataForPOF(
        bytes32 assetId,
        bytes32 _event
    )
        internal
        view
        returns (bytes32)
    {
        (, uint256  scheduleTime) = decodeEvent(_event);

        address currency = assetRegistry.getAddressValueForTermsAttribute(assetId, "currency");
        address settlementCurrency = assetRegistry.getAddressValueForTermsAttribute(assetId, "settlementCurrency");

        if (currency != settlementCurrency) {
            // get FX rate
            (int256 fxRate, bool isSet) = marketObjectRegistry.getDataPointOfMarketObject(
                keccak256(abi.encode(currency, settlementCurrency)),
                scheduleTime
            );
            if (isSet) return bytes32(fxRate);
        }
    }
}
