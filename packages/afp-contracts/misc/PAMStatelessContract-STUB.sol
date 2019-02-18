pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

contract StatelessContract {

	struct AFPEvent {
		uint eventDate;
		EventType eventType;
		int eventValue;
		Currency eventCurrency;
		int nominalValue;
		int nominalRate;
		int nominalAccrued;
		int childValue;
		EventLevel level;
	}
		
	struct ContractTerms {
		uint contractDealDate;
		uint initialExchangeDate;
		uint statusDate;
		int notionalPrincipal;
		DayCountConvention dayCountConvention;
		int PDIED; // PremiumDiscountAtIED
	}
	
	struct Parameters {
		int payment;
	}
	
	struct ContractState {
		int nominalValue;
	}
	
	// Constants:
	int256 constant INT256_MIN = int256((uint256(1) << 255));
	int256 constant INT256_MAX = int256(~((uint256(1) << 255)));
	uint256 constant UINT256_MIN = 0;
	uint256 constant UINT256_MAX = ~uint256(0);

	int DOUBLE_NULL = INT256_MIN;

	// Enums
	enum EventType {IED, MD}
	enum Calendar {NULL, NOCALENDAR, WEEKDAY}
	enum BusinesDayConvention {NULL, SCF, SCMF, CSF, CSMF, SCP, SCMP, CSP, CSMP}
	enum ClearingHouse {YES, NO}
	enum ContractRole {RPA, RPL, LG, ST, RFL, PFL, BUYER, SELLER, GUARANTOR, OBLIGEE}
	enum ContractStatus {PF, DL, DQ, DF}
	enum ContractType {PAM, ANN, NAM, LAM, LAX, STK, UMP, CEG, FXOUT, SWAPS, FUTUR, OPTNS}
	enum Currency {USD, EUR, ETH, ERC20}
	enum CyclePointOfInterestPayment {BeginningOf, EndOf}
	enum CyclePointOfRateReset {BeginningOf, EndOf}
	enum CycleTriggerOfOptionality {IP, PR, RR}
	enum DayCountConvention {A_AISDA, A_360, A_365, _30E_360ISDA, _30E_360, _30_360, BUS_252}
	enum DeliverySettlement {S, D}
	enum EndOfMonthConvention {EOM, SD}
	enum EventLevel {P}
	enum FeeBasis {A, N}
	enum InterestCalculationBase {NT, NTIED, NTL}
	enum OptionExecutionType {E, B, A}
	enum OptionStrikeDriver {FX, IR, PR}
	enum OptionType {C, P, CP}
	enum PenaltyType {O, A, N, I}
	enum PrepaymentEffect {N, A, M}
	enum ScalingEffect {I00, IN0, I0M, INM, _000, _0N0, _00M, _0NM}
	enum Seniority {S, J}
	enum Unit {BRL, BSH, GLN, CUU, MWH, PND, STN, TON, TRO}
	
	function yfr(uint dateTimeEnd, uint dateTimeBegin, DayCountConvention ipdc) internal pure returns (uint) {
		// TODO: Implement
		require(dateTimeEnd >= dateTimeBegin, "End time must be later than begin time");
		if (ipdc == DayCountConvention._30_360) {
				return (dateTimeEnd - dateTimeBegin) / 360;
		} else {
				return 1;
		}
		
	}

	function signum(int value) internal pure returns (int) {
		// TODO: implement
		if (value > 0) { 
				return 1;
		} else if (value < 0) {
				return -1;
		} else {
				return INT256_MIN;
		}
	}
}


contract PAMStatelessContract is StatelessContract{
	
	function getFirstState(ContractTerms params) public pure returns (ContractState state, AFPEvent afpEvent){
		int IED = 0 - params.notionalPrincipal - params.PDIED;
		afpEvent = AFPEvent(params.contractDealDate,EventType.IED, IED, Currency.USD, params.notionalPrincipal, 0 ether, 0 ether, 0 ether, EventLevel.P);
		state = ContractState(params.notionalPrincipal);
		return (state, afpEvent);
	}
	
	function getNextState(ContractState currentState, Parameters params) public pure returns (ContractState nextState, AFPEvent afpEvent){
		uint ED = 1535714581 + 3 days;
		int MD = currentState.nominalValue;
		nextState.nominalValue = currentState.nominalValue-params.payment - 5 ether;
		afpEvent = AFPEvent(ED, EventType.MD, MD, Currency.USD, nextState.nominalValue, 0 ether, 0 ether, 0 ether, EventLevel.P);
		return (currentState, afpEvent);
	}
	
	function testGetFirstState() public pure returns (ContractState state, AFPEvent afpEvent){
		ContractTerms memory ip = ContractTerms(
			1535714581, // contractDealDate
			1535714581, // initialExchangeDate
			1535714581, // statusDate
			1000 ether, // notionalPrincipal
			DayCountConvention._30_360, 
			-5 ether // PremiumDiscountAtIED
		);
				
		return getFirstState(ip);
	}
	
	function testGetNextState() public pure returns (ContractState nextState, AFPEvent afpEvent){
		(ContractState memory currentState, AFPEvent memory firstEvent) =  testGetFirstState();
		Parameters memory params = Parameters(
				995 ether // payment
		);
		return getNextState(currentState, params);
	}
}
