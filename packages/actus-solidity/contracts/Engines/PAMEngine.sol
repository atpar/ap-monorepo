pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../Core/Core.sol";
import "./BaseEngine.sol";
import "./IEngine.sol";
import "./STF.sol";
import "./POF.sol";


/**
 * @title PAMEngine
 * @notice Inherits from BaseEngine by implementing STFs, POFs according to the ACTUS standard for a PAM contract
 * @dev All numbers except unix timestamp are represented as multiple of 10 ** 18
 */
contract PAMEngine is BaseEngine, STF, POF {

    /**
     * @notice Initialize contract state space based on the contract terms.
     * @param terms terms of the contract
     * @return the initial state of the contract
     */
    function computeInitialState(LifecycleTerms memory terms)
        public
        pure
        returns (State memory)
    {
        State memory state;

        state.contractPerformance = ContractPerformance.PF;
        state.notionalScalingMultiplier = int256(1 * 10 ** PRECISION);
        state.interestScalingMultiplier = int256(1 * 10 ** PRECISION);
        state.statusDate = terms.statusDate;
        state.maturityDate = terms.maturityDate;
        state.notionalPrincipal = terms.notionalPrincipal;
        state.nominalInterestRate = terms.nominalInterestRate;
        state.accruedInterest = terms.accruedInterest;
        state.feeAccrued = terms.feeAccrued;

        return state;
    }

    /**
     * @notice Computes a schedule segment of non-cyclic contract events based on the contract terms
     * and the specified timestamps.
     * @param terms terms of the contract
     * @param segmentStart start timestamp of the segment
     * @param segmentEnd end timestamp of the segement
     * @return segment of the non-cyclic schedule
     */
    function computeNonCyclicScheduleSegment(
        GeneratingTerms memory terms,
        uint256 segmentStart,
        uint256 segmentEnd
    )
        public
        pure
        returns (bytes32[MAX_EVENT_SCHEDULE_SIZE] memory)
    {
        bytes32[MAX_EVENT_SCHEDULE_SIZE] memory _eventSchedule;
        uint16 index = 0;

        // initial exchange
        if (terms.purchaseDate == 0 && isInSegment(terms.initialExchangeDate, segmentStart, segmentEnd)) {
            _eventSchedule[index] = encodeEvent(EventType.IED, terms.initialExchangeDate);
            index++;
        }

        // purchase
        if (terms.purchaseDate != 0) {
            if (isInSegment(terms.purchaseDate, segmentStart, segmentEnd)) {
                _eventSchedule[index] = encodeEvent(EventType.PRD, terms.purchaseDate);
                index++;
            }
        }

        // termination
        if (terms.terminationDate != 0) {
            if (isInSegment(terms.terminationDate, segmentStart, segmentEnd)) {
                _eventSchedule[index] = encodeEvent(EventType.TD, terms.terminationDate);
                index++;
            }
        }

        // principal redemption
        if (isInSegment(terms.maturityDate, segmentStart, segmentEnd)) {
            _eventSchedule[index] = encodeEvent(EventType.MD, terms.maturityDate);
            index++;
        }

        return _eventSchedule;
    }

    /**
     * @notice Computes a schedule segment of cyclic contract events based on the contract terms
     * and the specified timestamps.
     * @param terms terms of the contract
     * @param segmentStart start timestamp of the segment
     * @param segmentEnd end timestamp of the segement
     * @param eventType eventType of the cyclic schedule
     * @return event schedule segment
     */
    function computeCyclicScheduleSegment(
        GeneratingTerms memory terms,
        uint256 segmentStart,
        uint256 segmentEnd,
        EventType eventType
    )
        public
        pure
        returns(bytes32[MAX_EVENT_SCHEDULE_SIZE] memory)
    {
        bytes32[MAX_EVENT_SCHEDULE_SIZE] memory _eventSchedule;

        if (eventType == EventType.IP) {
            uint256 index = 0;

            // interest payment related (covers pre-repayment period only,
            // starting with PRANX interest is paid following the PR schedule)
            if (
                terms.cycleOfInterestPayment.isSet == true
                && terms.cycleAnchorDateOfInterestPayment != 0
            ) {
                uint256[MAX_CYCLE_SIZE] memory interestPaymentSchedule = computeDatesFromCycleSegment(
                    terms.cycleAnchorDateOfInterestPayment,
                    terms.maturityDate,
                    terms.cycleOfInterestPayment,
                    true,
                    segmentStart,
                    segmentEnd
                );
                for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
                    if (interestPaymentSchedule[i] == 0) break;
                    if (interestPaymentSchedule[i] <= terms.capitalizationEndDate) continue;
                    if (isInSegment(interestPaymentSchedule[i], segmentStart, segmentEnd) == false) continue;
                    _eventSchedule[index] = encodeEvent(EventType.IP, interestPaymentSchedule[i]);
                    index++;
                }
            }
        }

        if (eventType == EventType.IPCI) {
            uint256 index = 0;

            // IPCI
            if (
                terms.cycleOfInterestPayment.isSet == true
                && terms.cycleAnchorDateOfInterestPayment != 0
                && terms.capitalizationEndDate != 0
            ) {
                IPS memory cycleOfInterestCapitalization = terms.cycleOfInterestPayment;
                cycleOfInterestCapitalization.s = S.SHORT;

                uint256[MAX_CYCLE_SIZE] memory interestPaymentSchedule = computeDatesFromCycleSegment(
                    terms.cycleAnchorDateOfInterestPayment,
                    terms.capitalizationEndDate,
                    cycleOfInterestCapitalization,
                    true,
                    segmentStart,
                    segmentEnd
                );
                for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
                    if (interestPaymentSchedule[i] == 0) break;
                    if (isInSegment(interestPaymentSchedule[i], segmentStart, segmentEnd) == false) continue;
                    _eventSchedule[index] = encodeEvent(EventType.IPCI, interestPaymentSchedule[i]);
                    index++;
                }
            }
        }

        if (eventType == EventType.RR) {
            uint256 index = 0;

            // rate reset
            if (terms.cycleOfRateReset.isSet == true && terms.cycleAnchorDateOfRateReset != 0) {
                uint256[MAX_CYCLE_SIZE] memory rateResetSchedule = computeDatesFromCycleSegment(
                    terms.cycleAnchorDateOfRateReset,
                    terms.maturityDate,
                    terms.cycleOfRateReset,
                    false,
                    segmentStart,
                    segmentEnd
                );
                for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
                    if (rateResetSchedule[i] == 0) break;
                    if (isInSegment(rateResetSchedule[i], segmentStart, segmentEnd) == false) continue;
                    _eventSchedule[index] = encodeEvent(EventType.RR, rateResetSchedule[i]);
                    index++;
                }
            }
            // ... nextRateReset
        }

        if (eventType == EventType.FP) {
            uint256 index = 0;

            // fees
            if (terms.cycleOfFee.isSet == true && terms.cycleAnchorDateOfFee != 0) {
                uint256[MAX_CYCLE_SIZE] memory feeSchedule = computeDatesFromCycleSegment(
                    terms.cycleAnchorDateOfFee,
                    terms.maturityDate,
                    terms.cycleOfFee,
                    true,
                    segmentStart,
                    segmentEnd
                );
                for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
                    if (feeSchedule[i] == 0) break;
                    if (isInSegment(feeSchedule[i], segmentStart, segmentEnd) == false) continue;
                    _eventSchedule[index] = encodeEvent(EventType.FP, feeSchedule[i]);
                    index++;
                }
            }
        }

        if (eventType == EventType.SC) {
            uint256 index;

            // scaling
            if ((terms.scalingEffect != ScalingEffect._000 || terms.scalingEffect != ScalingEffect._00M)
                && terms.cycleAnchorDateOfScalingIndex != 0
            ) {
                uint256[MAX_CYCLE_SIZE] memory scalingSchedule = computeDatesFromCycleSegment(
                    terms.cycleAnchorDateOfScalingIndex,
                    terms.maturityDate,
                    terms.cycleOfScalingIndex,
                    true,
                    segmentStart,
                    segmentEnd
                );
                for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
                    if (scalingSchedule[i] == 0) break;
                    if (isInSegment(scalingSchedule[i], segmentStart, segmentEnd) == false) continue;
                    _eventSchedule[index] = encodeEvent(EventType.SC, scalingSchedule[i]);
                    index++;
                }
            }
        }

        return _eventSchedule;
    }

    /**
     * @notice Verifies that the provided event is still scheduled under the terms, the current state of the
     * contract and the current state of the underlying.
     * @param _event event for which to check if its still scheduled
     * @param terms terms of the contract
     * @param state current state of the contract
     * @param hasUnderlying boolean indicating whether the contract has an underlying contract
     * @param underlyingState state of the underlying (empty state object if non-existing)
     * @return boolean indicating whether event is still scheduled
     */
    function isEventScheduled(
        bytes32 _event,
        LifecycleTerms memory terms,
        State memory state,
        bool hasUnderlying,
        State memory underlyingState
    )
        public
        pure
        returns (bool)
    {
        return true;
    }

    /**
     * @notice Implements abstract method which is defined in BaseEngine.
     * Applies an event to the current state of the contract and returns the resulting state.
     * The inheriting Engine contract has to map the events type to the designated STF.
     * todo Annuity calculator for RR/RRF events, IPCB events and ICB state variable
     * @param terms terms of the contract
     * @param state current state of the contract
     * @param _event event for which to evaluate the next state for
     * @param externalData external data needed for STF evaluation (e.g. rate for RR events)
     * @return the resulting contract state
     */
    function stateTransitionFunction(
        LifecycleTerms memory terms,
        State memory state,
        bytes32 _event,
        bytes32 externalData
    )
        private
        pure
        returns (State memory)
    {
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);
        /*
         * Note:
         * Not supported: PRD events
         */
		if (eventType == EventType.AD) return STF_PAM_AD(terms, state, scheduleTime, externalData);
		if (eventType == EventType.FP) return STF_PAM_FP(terms, state, scheduleTime, externalData);
		if (eventType == EventType.IED) return STF_PAM_IED(terms, state, scheduleTime, externalData);
		if (eventType == EventType.IPCI) return STF_PAM_IPCI(terms, state, scheduleTime, externalData);
		if (eventType == EventType.IP) return STF_PAM_IP(terms, state, scheduleTime, externalData);
		if (eventType == EventType.PP) return STF_PAM_PP(terms, state, scheduleTime, externalData);
		//if (eventType == EventType.PRD) return STF_PAM_PRD(terms, state, scheduleTime, externalData);
		if (eventType == EventType.MD) return STF_PAM_PR(terms, state, scheduleTime, externalData);
		if (eventType == EventType.PY) return STF_PAM_PY(terms, state, scheduleTime, externalData);
		if (eventType == EventType.RRF) return STF_PAM_RRF(terms, state, scheduleTime, externalData);
		if (eventType == EventType.RR) return STF_PAM_RR(terms, state, scheduleTime, externalData);
		if (eventType == EventType.SC) return STF_PAM_SC(terms, state, scheduleTime, externalData);
		if (eventType == EventType.TD) return STF_PAM_TD(terms, state, scheduleTime, externalData);
		if (eventType == EventType.CE)  return STF_PAM_CE(terms, state, scheduleTime, externalData);

        revert("PAMEngine.stateTransitionFunction: ATTRIBUTE_NOT_FOUND");
    }

    /**
     * @notice Implements abstract method which is defined in BaseEngine.
     * Computes the payoff for an event under the current state of the contract.
     * The inheriting Engine contract has to map the events type to the designated POF.
     * todo IPCB events and Icb state variable, Icb state variable updates in IP-paying events
     * @param terms terms of the contract
     * @param state current state of the contract
     * @param _event event for which the payoff should be evaluated
     * @param externalData external data needed for POF evaluation (e.g. fxRate)
     * @return the payoff of the event
     */
    function payoffFunction(
        LifecycleTerms memory terms,
        State memory state,
        bytes32 _event,
        bytes32 externalData
    )
        private
        pure
        returns (int256)
    {
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

		/*
		 * Note: PAM contracts don't have IPCB and PR events.
         * Not supported: PRD events
		 */

		if (eventType == EventType.AD) return 0; // Analysis Event
		if (eventType == EventType.IPCI) return 0; // Interest Capitalization Event
		if (eventType == EventType.RRF) return 0; // Rate Reset Fixed
		if (eventType == EventType.RR) return 0; // Rate Reset Variable
		if (eventType == EventType.SC) return 0; // Scaling Index Revision
		if (eventType == EventType.CE) return 0; // Credit Event
		if (eventType == EventType.FP) return POF_PAM_FP(terms, state, scheduleTime, externalData); // Fee Payment
		if (eventType == EventType.IED) return POF_PAM_IED(terms, state, scheduleTime, externalData); // Intital Exchange
		if (eventType == EventType.IP) return POF_PAM_IP(terms, state, scheduleTime, externalData); // Interest Payment
		if (eventType == EventType.PP) return POF_PAM_PP(terms, state, scheduleTime, externalData); // Principal Prepayment
		//if (eventType == EventType.PRD) return POF_PAM_PRD(terms, state, scheduleTime, externalData); // Purchase
		if (eventType == EventType.MD) return POF_PAM_MD(terms, state, scheduleTime, externalData); // Maturity
		if (eventType == EventType.PY) return POF_PAM_PY(terms, state, scheduleTime, externalData); // Penalty Payment
		if (eventType == EventType.TD) return POF_PAM_TD(terms, state, scheduleTime, externalData); // Termination

        revert("PAMEngine.payoffFunction: ATTRIBUTE_NOT_FOUND");
    }
}
