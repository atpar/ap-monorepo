pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./IPAMStatelessContract.sol";
import "./AFPCore/AFPDefinitions.sol";
import "./external/open-zeppelin-solidity/Ownable.sol";
import "./external/open-zeppelin-solidity/IERC20.sol";

contract PAMStatefulContractOnChain_Explicit is Ownable, AFPDefinitions {

	event Event(
		EventType eventType, 
		uint256 scheduledTime, 
		uint256 actualEventTime, 
		int256 payOff, 
		Currency currency
	);

	struct Terms {
		Calendar calendar;
		ContractRole contractRole;
		string legalEntityIdRecordCreator;
		string legalEntityIdCounterparty;
		DayCountConvention dayCountConvention;
		BusinessDayConvention businessDayConvention;
		EndOfMonthConvention endOfMonthConvention;
		Currency currency;
		ScalingEffect scalingEffect;
		PenaltyType penaltyType;
		FeeBasis feeBasis;
	}

	Terms terms;

	/**
	 * dates
	 * [0] - statusDate
	 * [1] - initialExchangeDate
	 * [2] - maturityDate
	 * [3] - terminationDate
	 * [4] - purchaseDate
	 * [5] - capitalizationEndDate
	 * [6] - cycleAnchorDateOfInterestPayment
	 * [7] - cycleAnchorDateOfRateReset
	 * [8] - cycleAnchorDateOfScalingIndex
	 * [9] - cycleAnchorDateOfFee
	 */
	uint256[10] dates;


	/**
	 * parameters
	 * [0] - notionalPrincipal
	 * [1] - nominalInterestRate
	 * [2] - feeAccrued
	 * [3] - accruedInterest
	 * [4] - rateMultiplier
	 * [5] - rateSpread
	 * [6] - feeRate
	 * [7] - nextResetRate
	 * [8] - penaltyRate
	 * [9] - premiumDiscountAtIED
	 * [10] - priceAtPurchaseDate
	 */
	int256[11] parameters;

	/**
	 * cycles
	 * [0] - cycleOfInterestPayment
	 * [1] - cycleOfRateReset
	 * [2] - cycleOfScalingIndex
	 * [3] - cycleOfFee
	 */
	IPS[4] cycles;

	/**
	 * bounds
	 * [0] - lifeCap
	 * [1] - lifePeriod
	 * [2] - lifeFloor
	 * [3] - periodCap
	 * [4] - periodFloor
	 */
	int256[5] bounds;
	
	uint256 delinquencyPeriod;
	uint256 gracePeriod;


	ContractState contractState;

	uint256[2][MAX_EVENT_SCHEDULE_SIZE] public contractEventSchedule;
	uint256 contractEventScheduleIndex = 0;

	address payable public recordCreator;
	address payable public counterparty;
	IERC20 public token;

	IPAMStatelessContract public pamStatelessContract;

	modifier notInDefault() {
		require(contractState.contractStatus != ContractStatus.DF, "contract is in default");
		_;
	}

	modifier onlyRecordCreator() {
		require(msg.sender == recordCreator, "sender is not record creactor");
		_;
	}

	modifier onlyCounterparty() {
		require(msg.sender == counterparty, "sender is not counterparty");
		_;
	}

	/**
	 * @notice constructor for creating the PAMStatefulContract
						 in practice the contract terms are set in the contructor 
						 via the initialize() method
	 * @param _pamStatelessContract adress of the PAMStatelessContract
	 * @param _recordCreator address of the record creator
	 * @param _counterparty address of the counterparty
	 * @param _token address of the ERC20 token contract to settle the payoff (optional)
	 */
	constructor(
		address _pamStatelessContract,
		address payable _recordCreator, 
		address payable _counterparty, 
		address payable _token
	) 
		public 
	{
		require(_recordCreator != address(0), "_recordCreator address is invalid");
		require(_counterparty != address(0), "_counteraprty address is invalid");
		
		pamStatelessContract = IPAMStatelessContract(_pamStatelessContract); // check code size ...
		
		recordCreator = _recordCreator;
		counterparty = _counterparty;
		token = IERC20(_token);
		
		if (_token != address(0)) { 
			require(token.totalSupply() > 0, "specified token is not conform"); 
		}
	}

	/**
	 * @notice set the terms of the contract as well non-actus parameters 
						 delinquency period and grace period
	 * @param _contractTerms terms of the contract
	 * @param _delinquencyPeriod delinquency period of the payments to be made by the counterparty
	 * @param _gracePeriod grace period of the payments to be made by the counterparty
	 */
	function initialize(
		PAMContractTerms memory _contractTerms,
		uint256 _delinquencyPeriod,
		uint256 _gracePeriod
	)
		public
	{
		setContractTerms(_contractTerms, _delinquencyPeriod, _gracePeriod);
		(contractState, contractEventSchedule) = pamStatelessContract.getInitialState(_contractTerms);
	}

	/**
	 * @notice evaluate and apply the next contract event to the contract state 
						 and return the contract events payoff
	 * @dev in practice the timestamp would be block.timestamp
	 * @param _timestamp the current timestamp
	 * @return pay off
	 */
	function proceed(uint256 _timestamp) 
		private 
		returns(int256)
	{
		PAMContractTerms memory contractTerms = unpackContractTerms();

		ContractEvent memory contractEvent = ContractEvent(
			contractEventSchedule[contractEventScheduleIndex][1], 
			EventType(contractEventSchedule[contractEventScheduleIndex][0]),
			Currency(0),
			0,
			_timestamp
		);

		ContractState memory postContractState;
		ContractEvent memory evaluatedContractEvent;

		(postContractState, evaluatedContractEvent) = pamStatelessContract.getNextState(
			contractTerms,
			contractState, 
			contractEvent,
			contractEvent.scheduledTime
		);

		emit Event(
			evaluatedContractEvent.eventType,
			evaluatedContractEvent.scheduledTime, 
			evaluatedContractEvent.actualEventTime,
			evaluatedContractEvent.payOff,
			evaluatedContractEvent.currency
		);

		contractState = postContractState;
		contractEventScheduleIndex = contractEventScheduleIndex + 1;

		return(evaluatedContractEvent.payOff);
	}

	/**
	 * @notice sets the terms for the contract
	 * @param _contractTerms terms of the contract
	 * @param _delinquencyPeriod delinquency period of the payments to be made by the counterparty
	 * @param _gracePeriod grace period of the payments to be made by the counterparty
	 */
	function setContractTerms(
		PAMContractTerms memory _contractTerms, 
		uint256 _delinquencyPeriod,
		uint256 _gracePeriod
	) 
		private 
	{
		terms = Terms(
			_contractTerms.calendar,
			_contractTerms.contractRole,
			_contractTerms.legalEntityIdRecordCreator,
			_contractTerms.legalEntityIdCounterparty,
			_contractTerms.dayCountConvention,
			_contractTerms.businessDayConvention,
			_contractTerms.endOfMonthConvention,
			_contractTerms.currency,
			_contractTerms.scalingEffect,
			_contractTerms.penaltyType,
			_contractTerms.feeBasis
		);

		dates = [
			_contractTerms.statusDate, 
			_contractTerms.initialExchangeDate, 
			_contractTerms.maturityDate,
			_contractTerms.terminationDate,
			_contractTerms.purchaseDate,
			_contractTerms.capitalizationEndDate,
			_contractTerms.cycleAnchorDateOfInterestPayment,
			_contractTerms.cycleAnchorDateOfRateReset,
			_contractTerms.cycleAnchorDateOfScalingIndex,
			_contractTerms.cycleAnchorDateOfFee
		];

		parameters = [
			_contractTerms.notionalPrincipal, 
			_contractTerms.nominalInterestRate, 
			_contractTerms.feeAccrued,
			_contractTerms.accruedInterest,
			_contractTerms.rateMultiplier,
			_contractTerms.rateSpread,
			_contractTerms.feeRate,
			_contractTerms.nextResetRate,
			_contractTerms.penaltyRate,
			_contractTerms.premiumDiscountAtIED,
			_contractTerms.priceAtPurchaseDate
		];

		cycles[0] = _contractTerms.cycleOfInterestPayment;
		cycles[1] = _contractTerms.cycleOfRateReset;
		cycles[2] = _contractTerms.cycleOfScalingIndex;
		cycles[3] = _contractTerms.cycleOfFee;

		bounds = [
			_contractTerms.lifeCap,
			_contractTerms.lifePeriod,
			_contractTerms.lifeFloor,
			_contractTerms.periodCap,
			_contractTerms.periodFloor
		];

		delinquencyPeriod = _delinquencyPeriod;
		gracePeriod = _gracePeriod;
	}

	/**
	 * @notice pay principal amount to the counterparty specified in 
						 the contract terms through an ERC20 token or in ether
	 */
	function payPrincipal(uint256 _timestamp) 
		public 
		payable
		notInDefault()
		onlyRecordCreator()
	{
		require(uint256(EventType.IED) == contractEventSchedule[contractEventScheduleIndex][0], "event not scheduled");
		int256 payOff = proceed(_timestamp);
		uint256 value = uint256(-payOff);

		if (msg.value == 0) {
			require(token != IERC20(0), "no token specified");
			require(token.allowance(recordCreator, counterparty) >= value, "token allowance is insufficient");
			require(token.transferFrom(recordCreator, counterparty, value), "token transfer failed");
		} else {
			require(msg.value >= value, "amount of ether send is insufficient ");
			address(counterparty).transfer(value);
		}
	}

	/**
	 * @notice pay interest to record creator for the current cycle through 
						 an ERC20 token or in ether
	 */
	function payInterest(uint256 _timestamp) 
		public
		payable
		notInDefault()
		onlyCounterparty()
	{
		require(uint256(EventType.IP) == contractEventSchedule[contractEventScheduleIndex][0], "event not scheduled");
		int256 payOff = proceed(_timestamp);
		uint256 value = uint256(payOff);

		if (value == 0) { 
			return; 
		}

		if (msg.value == 0) {
			require(token != IERC20(0), "no token specified");
			require(token.allowance(counterparty, recordCreator) >= value, "token allowance is insufficient");
			require(token.transferFrom(counterparty, recordCreator, value), "token transfer failed");
		} else {
			require(msg.value >= value, "amount of ether send is insufficient ");
			recordCreator.transfer(value);
		}
	}

	/**
	 * @notice redeem the principal to the record creator through an ERC20 token or in ether
	 */
	function redeemPrinicipal(uint256 _timestamp) 
		public
		payable
		notInDefault()
		onlyCounterparty()
	{
		require(uint256(EventType.PR) == contractEventSchedule[contractEventScheduleIndex][0], "event not scheduled");
		int256 payOff = proceed(_timestamp);
		uint256 value = uint256(payOff);

		if (msg.value == 0) {
			require(token != IERC20(0), "no token specified");
			require(token.allowance(counterparty, recordCreator) >= value, "token allowance is insufficient");
			require(token.transferFrom(counterparty, recordCreator, value), "token transfer failed");
		} else {
			require(msg.value >= value, "amount of ether send is insufficient ");
			recordCreator.transfer(value);
		}
	}

	/**
	 * Todo
	 */
	function payPenalty(uint256 _timestamp)
		public
		payable
		notInDefault()
		onlyCounterparty()
	{
		require(uint256(EventType.PP) == contractEventSchedule[contractEventScheduleIndex][0], "event not scheduled");
		int256 payOff = proceed(_timestamp);
		uint256 value = uint256(payOff);

		if (msg.value == 0) {
			require(token != IERC20(0), "no token specified");
			require(token.allowance(counterparty, recordCreator) >= value, "token allowance is insufficient");
			require(token.transferFrom(counterparty, recordCreator, value), "token transfer failed");
		} else {
			require(msg.value >= value, "amount of ether send is insufficient ");
			recordCreator.transfer(value);
		}
	}

	// declare penalty ...

	/**
	 * Todo ...
	 */
	function resetRate(uint256 _timestamp)
		public
		notInDefault()
	{
		
	}

	/**
	 * Todo
	 */
	function declareDefault(uint256 _timestamp) 
		public
		notInDefault() 
		onlyRecordCreator()
	{
		require(_timestamp > contractEventSchedule[contractEventScheduleIndex][1] + delinquencyPeriod + gracePeriod, "can not declare default at this time");
		
		contractEventSchedule[contractEventScheduleIndex + 1][0] = uint256(EventType.CD);
		contractEventSchedule[contractEventScheduleIndex + 1][1] = _timestamp;

		proceed(_timestamp);
	}

	/**
	 * @notice return the contract terms as an PAMContractTerms object
	 * @return PAMContractTerms
	 */
	function unpackContractTerms() 
		private
		view
		returns(PAMContractTerms memory)
	{
		return PAMContractTerms(
			terms.calendar,
			terms.contractRole,
			terms.legalEntityIdRecordCreator,
			terms.legalEntityIdCounterparty,
			terms.dayCountConvention,
			terms.businessDayConvention,
			terms.endOfMonthConvention,
			terms.currency,
			terms.scalingEffect,
			terms.penaltyType,
			terms.feeBasis,
			dates[0],
			dates[1],
			dates[2],
			dates[3],
			dates[4],
			dates[5],
			dates[6],
			dates[7],
			dates[8],
			dates[9],
			parameters[0],
			parameters[1],
			parameters[2],
			parameters[3],
			parameters[4],
			parameters[5],
			parameters[6],
			parameters[7],
			parameters[8],
			parameters[9],
			parameters[10],
			cycles[0],
			cycles[1],
			cycles[2],
			cycles[3],
			bounds[0],
			bounds[1],
			bounds[2],
			bounds[3],
			bounds[4]
		);
	}

	/**
	 * @dev returns the terms of the contract
	 * @return PAMContractTerms
	 */
	function getContractTerms() 
		public 
		view 
		returns(PAMContractTerms memory) 
	{
		return(unpackContractTerms());
	}

	/**
	 * @dev returns the state of the contract
	 * @return ContractState
	 */
	function getContractState()
		public
		view
		returns(ContractState memory)
	{
		return(contractState);
	}

	/**
	 * @dev returns the contract event schedule
	 * @return contractEventSchedule
	 */
	function getContractEventSchedule()
		public
		view
		returns(uint256[2][MAX_EVENT_SCHEDULE_SIZE] memory)
	{
		return(contractEventSchedule);
	}

	/**
	 * @dev returns the current index of the contract event schedule
	 * @return contractEventScheduleIndex
	 */
	function getContractEventScheduleIndex()
		public
		view
		returns(uint256)
	{ 
		return(contractEventScheduleIndex);
	}
}
