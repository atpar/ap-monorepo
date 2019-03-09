pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./IPAMStatelessContract.sol";
import "./AFPCore/AFPDefinitions.sol";
import "./external/open-zeppelin-solidity/Ownable.sol";
import "./external/open-zeppelin-solidity/IERC20.sol";

contract PAMStatefulContractOnChain_Explicit_Encoded is Ownable, AFPDefinitions {

	event Event(
		EventType eventType, 
		uint256 scheduledTime, 
		uint256 actualEventTime, 
		int256 payOff, 
		Currency currency
	);

	address payable public recordCreator;
	address payable public counterparty;

	IERC20 public token;
	IPAMStatelessContract public pamStatelessContract;

	/**
	 * enums
	 * [0] - << 248 - calendar
	 * [0] - << 240 - contractRoel
	 * [0] - << 232 - dayCountConvention
	 * [0] - << 224 - businessDayConvention
	 * [0] - << 216 - endOfMonthConvention
	 * [0] - << 208 - currency
	 * [0] - << 200 - scalingEffect
	 * [0] - << 192 - penaltyType
	 * [0] - << 184 - feeBasis
	 */
	bytes32 enums;

	string legalEntityIdRecordCreator; // pot. bytes32
	string legalEntityIdCounterparty;  // pot. bytes32
	
	/**
	 * dates
	 * [0] << 224 - statusDate
	 * [0] << 192 - initialExchangeDate
	 * [0] << 160 - maturityDate
	 * [0] << 128 - terminationDate
	 * [0] << 96  - purchaseDate
	 * [0] << 64  - capitalizationEndDate
	 * [1] << 224 - cycleAnchorDateOfInterestPayment
	 * [1] << 192 - cycleAnchorDateOfRateReset
	 * [1] << 160 - cycleAnchorDateOfScalingIndex
	 * [1] << 128  - cycleAnchorDateOfFee
	 * [1] << 96  - delinquencyPeriod
	 * [1] << 64  - gracePeriod
	 */
	bytes32[2] dates;

	/**
	 * values
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
	int256[11] values;

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

	/**
	 * contractStateDates
	 * [0] << 224 - lastEventTime
	 * [0] << 192 - timeFromLastEvent
	 */
	bytes32 contractStateDates;

	/**
	 * contractStateEnums
	 * [0] << 248 - contractStatus
	 * [0] << 240 - contractRoleSign
	 */
	bytes32 contractStateEnums;

	/**
	 * contractStateValues
	 * [0] - nominalValue
	 * [1] - nominalAccrued
	 * [2] - nominalRate
	 * [3] - feeAccrued
	 * [4] - interestScalingMultiplier
	 * [5] - nominalScalingMultiplier
	 */
	int256[7] contractStateValues;

	uint256[2][MAX_EVENT_SCHEDULE_SIZE] public contractEventSchedule;
	uint8 contractEventScheduleIndex;

	modifier notInDefault() {
		require(getContractStatus() != ContractStatus.DF, "contract is in default");
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
	 * @notice set the terms of the contract as well non-actus values 
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
		ContractState memory contractState;

		(contractState, contractEventSchedule) = pamStatelessContract.getInitialState(_contractTerms);

		setContractTerms(_contractTerms, _delinquencyPeriod, _gracePeriod);
		setContractState(contractState);
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
		ContractState memory contractState = unpackContractState();

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

		setContractState(postContractState);
		contractEventScheduleIndex = contractEventScheduleIndex + 1;

		return(evaluatedContractEvent.payOff);
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
		require(contractEventSchedule[contractEventScheduleIndex][0] == uint256(EventType.IED), "event not scheduled");
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
		require(contractEventSchedule[contractEventScheduleIndex][0] == uint256(EventType.IP), "event not scheduled");
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
		require(contractEventSchedule[contractEventScheduleIndex][0] == uint256(EventType.PR), "event not scheduled");
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
		require(contractEventSchedule[contractEventScheduleIndex][0] == uint256(EventType.PP), "event not scheduled");
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
		uint256 delinquencyPeriod = uint256(uint32(uint256(dates[1] >> 96)));
		uint256 gracePeriod = uint256(uint32(uint256(dates[1] >> 64)));

		require(_timestamp > contractEventSchedule[contractEventScheduleIndex][1] + delinquencyPeriod + gracePeriod, "can not declare default at this time");
		
		contractEventSchedule[contractEventScheduleIndex + 1][0] = uint256(EventType.CD);
		contractEventSchedule[contractEventScheduleIndex + 1][1] = _timestamp;

		proceed(_timestamp);
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
		enums = 
			bytes32(uint256(uint8(_contractTerms.calendar))) << 248 |
			bytes32(uint256(uint8(_contractTerms.contractRole))) << 240 |
			bytes32(uint256(uint8(_contractTerms.dayCountConvention))) << 232 |
			bytes32(uint256(uint8(_contractTerms.businessDayConvention))) << 224 |
			bytes32(uint256(uint8(_contractTerms.endOfMonthConvention))) << 216 |
			bytes32(uint256(uint8(_contractTerms.currency))) << 208 |
			bytes32(uint256(uint8(_contractTerms.scalingEffect))) << 200 |
			bytes32(uint256(uint8(_contractTerms.penaltyType))) << 192 |
			bytes32(uint256(uint8(_contractTerms.feeBasis))) << 184;

		legalEntityIdRecordCreator = _contractTerms.legalEntityIdRecordCreator;
		legalEntityIdCounterparty =  _contractTerms.legalEntityIdCounterparty;

		dates[0] =
			bytes32(_contractTerms.statusDate) << 224 |
			bytes32(_contractTerms.initialExchangeDate) << 192 |
			bytes32(_contractTerms.maturityDate) << 160 |
			bytes32(_contractTerms.terminationDate) << 128 |
			bytes32(_contractTerms.purchaseDate) << 96 |
			bytes32(_contractTerms.capitalizationEndDate) << 64;
		
		dates[1] = 
			bytes32(_contractTerms.cycleAnchorDateOfInterestPayment) << 224 |
			bytes32(_contractTerms.cycleAnchorDateOfRateReset) << 192 |
			bytes32(_contractTerms.cycleAnchorDateOfScalingIndex) << 160 |
			bytes32(_contractTerms.cycleAnchorDateOfFee) << 128 |
			bytes32(_delinquencyPeriod) << 96 |
			bytes32(_gracePeriod) << 64;

		values = [
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
	}

	/**
	 * @notice sets the state of the contract
	 * @param _contractState state of the contract
	 */
	function setContractState(ContractState memory _contractState) private {
		contractStateDates =
			bytes32(uint256(uint32(_contractState.lastEventTime))) << 224 |
			bytes32(uint256(uint32(_contractState.timeFromLastEvent))) << 192;

		contractStateEnums = 
			bytes32(uint256(uint32(_contractState.contractStatus))) << 248 |
			bytes32(uint256(uint32(_contractState.contractRoleSign))) << 240;

		contractStateValues = [
			_contractState.nominalValue,
			_contractState.nominalAccrued,
			_contractState.nominalRate,
			_contractState.feeAccrued,
			_contractState.interestScalingMultiplier,
			_contractState.nominalScalingMultiplier
		];
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
			Calendar(uint8(uint256(enums >> 248))),
			ContractRole(uint8(uint256(enums >> 240))),
			legalEntityIdRecordCreator,
			legalEntityIdCounterparty,
			DayCountConvention(uint8(uint256(enums >> 232))),
			BusinessDayConvention(uint8(uint256(enums >> 224))),
			EndOfMonthConvention(uint8(uint256(enums >> 216))),
			Currency(uint8(uint256(enums >> 208))),
			ScalingEffect(uint8(uint256(enums >> 200))),
			PenaltyType(uint8(uint256(enums >> 192))),
			FeeBasis(uint8(uint256(enums >> 184))),
			uint256(uint32(uint256(dates[0] >> 224))),
			uint256(uint32(uint256(dates[0] >> 192))),
			uint256(uint32(uint256(dates[0] >> 160))),
			uint256(uint32(uint256(dates[0] >> 128))),
			uint256(uint32(uint256(dates[0] >> 96))),
			uint256(uint32(uint256(dates[0] >> 64))),
			uint256(uint32(uint256(dates[1] >> 224))),
			uint256(uint32(uint256(dates[1] >> 192))),
			uint256(uint32(uint256(dates[1] >> 160))),
			uint256(uint32(uint256(dates[1] >> 128))),
			values[0],
			values[1],
			values[2],
			values[3],
			values[4],
			values[5],
			values[6],
			values[7],
			values[8],
			values[9],
			values[10],
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

	function unpackContractState() 
		private
		view 
		returns(ContractState memory) 
	{
		return ContractState(
			uint256(uint32(uint256(contractStateDates >> 224))),
			ContractStatus(uint32(uint256(contractStateEnums >> 248))),
			int256(uint32(uint256(contractStateDates >> 192))),
			contractStateValues[0],
			contractStateValues[1],
			contractStateValues[2],
			contractStateValues[3],
			contractStateValues[4],
			contractStateValues[5],
			ContractRole(uint32(uint256(contractStateEnums >> 240)))
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
		return(unpackContractState());
	}

	function getContractStatus()
		internal
		view
		returns(ContractStatus)
	{
		return(ContractStatus(uint8(uint256(contractStateEnums >> 248))));
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
