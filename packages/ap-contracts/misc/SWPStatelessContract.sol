pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "./AFPCore/AFPCore.sol";
import "./AFPCore/AFPFloatMath.sol";

/**
 * @title the stateless component for a Swap contract
 * @notice implements the STF and POF of the Actus standard for a Swap contract 
 * @dev all numbers except unix timestamp are represented of multiples of 10 ** 18
	inputs have to be multiplied by 10 ** 18, outputs have to divided by 10 ** 18
 */
contract SWPStatelessContract is AFPCore {

	using AFPFloatMath for int;

  /**
	 * @notice computes the next contract state based on the contract terms, state and the event type
	 * @param _currentTimestamp current timestamp
	 * @param _contractTerms terms of the contract
	 * @param _contractState current state of the contract
	 * @param _eventType event type
	 * @return next contract state
	 */
	function stateTransitionFunction(
		uint256 _currentTimestamp, 
		SWPContractTerms _contractTerms, 
		ContractState _contractState, 
		EventType _eventType
	) 
		private 
		pure
		returns(ContractState) 
	{}

  /**
	 * @notice calculates the payOff for the current time based on the contract terms, state and the event type
	 * @param _currentTimestamp current timestamp
	 * @param _contractTerms terms of the contract
	 * @param _contractState current state of the contract
	 * @param _eventType event type
	 * @return payOff
	 */
	function payOffFunction(
		uint256 _currentTimestamp, 
		SWPContractTerms _contractTerms, 
		ContractState _contractState, 
		EventType _eventType
	)
		private
		pure
		returns(int256 payOff)
	{}

  /**
	 * @notice computes the schedule for all contract events based on the contract terms
	 * @param _contractTerms terms of the contract
	 * @return event schedule
	 */
	function computeContractEventSchedule(SWPContractTerms _contractTerms) 
		private 
		pure 
		returns(uint256[2][MAX_EVENT_SCHEDULE_SIZE])
	{
    // // [EventTypeIndex, scheduledTime]
		// uint256[2][MAX_EVENT_SCHEDULE_SIZE] memory contractEvents;
		// uint16 index = 0;

    // // purchase
		// if (_contractTerms.purchaseDate != 0) {
		// 	contractEvents[index][0] = uint256(EventType.PRD);
		// 	contractEvents[index][1] = _contractTerms.purchaseDate;
		// 	index++; 
		// }


  }

  /**
	 * @notice initialize contract state space based on the contract terms
	 * @dev see initStateSpace()
	 * @param _contractTerms terms of the contract
	 * @return initial contract state
	 */
	function initializeContractState(SWPContractTerms _contractTerms) 
		private 
		pure
		returns(ContractState)
	{}

  /**
	 * @notice get the first contract state and schedule of events
	 * @param _contractTerms terms of the contract
	 * @return initial contract state and the event schedule
	 */
	function getInitialState(SWPContractTerms _contractTerms) 
		public 
		pure 
		returns (ContractState, uint256[2][MAX_EVENT_SCHEDULE_SIZE])
	{}

  /**
	 * @notice apply an event to the current state of a contract and return the evaluated event and the new contract state
	 * @dev see apply()
	 * @param _contractTerms terms of the contract
	 * @param _contractState current state of the contract
	 * @param _contractEvent event to be evaluated and applied to the contract state
	 * @return the new contract state and the evaluated event
	 */
	function getNextState(
		SWPContractTerms _contractTerms, 
		ContractState _contractState, 
		ContractEvent _contractEvent,
		uint256 _timestamp
	)
		public
		pure
		returns (ContractState, ContractEvent)
	{}
}
