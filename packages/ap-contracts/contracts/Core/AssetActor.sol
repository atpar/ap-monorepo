pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "actus-solidity/contracts/Core/Utils.sol";
import "actus-solidity/contracts/Engines/IEngine.sol";

import "./SharedTypes.sol";
import "./IAssetActor.sol";
import "./AssetRegistry/IAssetRegistry.sol";
import "./ProductRegistry/IProductRegistry.sol";
import "./MarketObjectRegistry/IMarketObjectRegistry.sol";


contract AssetActor is SharedTypes, Utils, IAssetActor, Ownable {

    event ProgressedAsset(bytes32 indexed assetId, EventType eventType, uint256 scheduleTime);

    event Status(bytes32 indexed assetId, bytes32 statusMessage);


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

        // skip progression if asset defaulted
        require(
            state.contractPerformance != ContractPerformance.DF,
            "AssetActor.progress: ASSET_IS_IN_DEFAULT"
        );

        // get event type and schedule time for the next event
        bytes32 _event = assetRegistry.getNextEvent(assetId);
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        // check if event is still scheduled under the current states of the asset and the underlying asset
        if (
            IEngine(engineAddress).isEventScheduled(
                _event,
                terms,
                state,
                (terms.contractReference_1.contractReferenceRole == ContractReferenceRole.CVE),
                assetRegistry.getState(terms.contractReference_1.object)
            ) == false
        ) {
            // skip the unscheduled event by incrementing the corresponding schedule index
            updateScheduleIndex(assetId, eventType);
            return;
        }

        // get external data for the next event
        // compute payoff and the next state by applying the event to the current state
        int256 payoff = IEngine(engineAddress).computePayoffForEvent(
            terms,
            state,
            _event,
            getExternalDataForPOF(_event, terms)
        );
        state = IEngine(engineAddress).computeStateForEvent(
            terms,
            state,
            _event,
            getExternalDataForSTF(_event, terms)
        );

        // try to settle payoff of event
        // solium-disable-next-line
        if (settlePayoffForEvent(assetId, _event, payoff, terms)) {
            // if obligation is fulfilled increment the corresponding schedule index of the processed event
            updateScheduleIndex(assetId, eventType);
        } else {
            // if the obligation can't be fulfilled and the performance changed from performant to DL, DQ or DF,
            // store the interim state of the asset (state if the current obligation was successfully settled)
            // (if the obligation is later fulfilled before the asset reaches default,
            // the interim state is used to derive subsequent states of the asset)
            if (state.contractPerformance == ContractPerformance.PF) {
                assetRegistry.setFinalizedState(assetId, state);
            }

            // create CreditEvent
            bytes32 ceEvent = encodeEvent(EventType.CE, scheduleTime);

            // derive the actual state of the asset by applying the CreditEvent (updates performance of asset)
            state = IEngine(engineAddress).computeStateForEvent(
                terms,
                state,
                ceEvent,
                getExternalDataForSTF(ceEvent, terms)
            );
        }

        // store the resulting state
        assetRegistry.setState(assetId, state);

        emit ProgressedAsset(assetId, eventType, scheduleTime);
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
     * @param terms terms of the asset
     */
    function settlePayoffForEvent(
        bytes32 assetId,
        bytes32 _event,
        int256 payoff,
        LifecycleTerms memory terms
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
        if (terms.contractReference_2.contractReferenceRole == ContractReferenceRole.CVI) {
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
            return bytes32(block.timestamp);
        } else if (eventType == EventType.XD) {
            // get the remaining notionalPrincipal from the underlying
            if (terms.contractReference_1.contractReferenceRole == ContractReferenceRole.CVE) {
                State memory underlyingState = assetRegistry.getState(terms.contractReference_1.object);
                return bytes32(underlyingState.notionalPrincipal);
            }
        }

        return bytes32(0);
    }

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
