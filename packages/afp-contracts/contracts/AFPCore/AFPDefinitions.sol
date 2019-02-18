pragma solidity ^0.5.2;

contract AFPDefinitions {

	int256 constant INT256_MIN = int256((uint256(1) << 255));
	int256 constant INT256_MAX = int256(~((uint256(1) << 255)));
	uint256 constant UINT256_MIN = 0;
	uint256 constant UINT256_MAX = ~uint256(0);
	int256 constant DOUBLE_NULL = INT256_MIN;

	uint256 constant public precision = 18;
 
	uint256 constant MAX_CYCLE_SCHEDULE_SIZE = 16;
	uint256 constant MAX_EVENT_SCHEDULE_SIZE = 64; // 4x MAX_CYCLE_SCHEDULE_SIZE for IP, RR, FP and SC

	// IPS
	enum P {D, W, M, Q, H, Y} // P=[D=Days, W=Weeks, M=Months, Q=Quarters, H=Halfyear, Y=Year]
	enum S {LONG, SHORT} // S=[+=long stub,- short stub, {} if S empty then - for short stub]
	struct IPS { 
		uint256 i; // I=Integer
		P p; 
		S s;
		bool isSet;
	}

	enum EventType {SD, MD, AD, IED, IP, PR, PP, PY, FP, PRD, TD, IPCI, RR, RRY, SC, CD, DV, MR, IPCB, STD, Child}
	enum Calendar {NULL, NoCalendar, MondayToFriday} // Custom: custom implementation of calendar  // Default: NULL
	enum BusinessDayConvention {NULL, SCF, SCMF, CSF, CSMF, SCP, SCMP, CSP, CSMP} // Default: NULL
	enum ClearingHouse {YES, NO} // required ?
	enum ContractRole {RPA, RPL, LG, ST, RFL, PFL, BUYER, SELLER, GUARANTOR, OBLIGEE} // required ?
	enum ContractStatus {PF, DL, DQ, DF} // Default: PF
	enum ContractType {PAM, ANN, NAM, LAM, LAX, CLM, UMP, CSH, STK, COM, SWAPS, SWPPV, FXOUT, CAPFL, FUTUR, OPTNS, CEG, CEC} // required ?
	enum Currency {USD, EUR, ETH, ERC20} // ISO4217 // required ?
	enum CyclePointOfInterestPayment {EndOf, BeginningOf} // Default: EndOf
	enum CyclePointOfRateReset {BeginningOf, EndOf} // Default: BeginningOf
	enum CycleTriggerOfOptionality {IP, PR, RR}
	enum DayCountConvention {A_AISDA, A_360, A_365, _30E_360ISDA, _30E_360, _30_360, BUS_252} // required ?
	enum EndOfMonthConvention {SD, EOM} // Default: SD
	enum EventLevel {P} // ?
	enum FeeBasis {A, N} // Default: Null
	enum InterestCalculationBase {NT, NTIED, NTL} // Default: NT
	enum MarketObjectCodeOfRateReset {USD_SWP, USD_GOV, CHF_SWP} // Must correspond to defined set of market objects // Default: CUR ?
	enum ObjectCodeOfPrepaymentModel {IDXY} // ?
	enum OptionExecutionType {E, B, A} // required ?
	enum OptionStrikeDriver {FX, IR, PR} // ?
	enum OptionType {C, P, CP} // required ?
	enum PenaltyType {O, A, N, I} // Default: 0
	enum PrepaymentEffect {N, A, M} // Default: N
	enum ScalingEffect {_000, _0N0, _00M, _0NM, I00, IN0, I0M, INM} // Default: _000 
	enum Seniority {S, J} // required ?
	enum Unit {BRL, BSH, GLN, CUU, MWH, PND, STN, TON, TRO} // required ?

	struct ContractState {
		uint256 lastEventTime;
		ContractStatus contractStatus;
		int256 timeFromLastEvent; // analytical result
		int256 nominalValue; // analytical result
		int256 nominalAccrued; // analytical result
		int256 feeAccrued; // analytical result
		int256 nominalRate; // analytical result
		// int256 interestCalculationBase;
		int256 interestScalingMultiplier;
		int256 nominalScalingMultiplier;
		// int256 nextPrincipalRedemptionPayment;
		// int256 secondaryNominalValue; // analytical result
		// int256 lastInterestPayment;
		// int256 payoffAtSettlement;
		// int256 variationMargin; // analytical result
		ContractRole contractRoleSign;
		// int256 nominalAccruedFix;
		// int256 nominalAccruedFloat;
		// uint8 probabilityOfDefault;
	}

	struct ContractEvent {
		// uint256 epochOffset;
		uint256 scheduledTime;
		EventType eventType;
		Currency currency;
		int256 payOff;
		uint256 actualEventTime;
	}

	struct PAMContractTerms {
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

		uint256 statusDate;
		uint256 initialExchangeDate;
		uint256 maturityDate;
		uint256 terminationDate;
		uint256 purchaseDate;
		uint256 capitalizationEndDate;
		uint256 cycleAnchorDateOfInterestPayment;
		uint256 cycleAnchorDateOfRateReset;
		uint256 cycleAnchorDateOfScalingIndex;
		uint256 cycleAnchorDateOfFee;

		int256 notionalPrincipal;
		int256 nominalInterestRate;
		int256 feeAccrued;
		int256 accruedInterest;
		int256 rateMultiplier;
		int256 rateSpread;
		int256 feeRate;
		int256 nextResetRate;
		int256 penaltyRate;
		int256 premiumDiscountAtIED;
		int256 priceAtPurchaseDate;

		IPS cycleOfInterestPayment;
		IPS cycleOfRateReset;
		IPS cycleOfScalingIndex;
		IPS cycleOfFee;

		int256 lifeCap;
		int256 lifePeriod;
		int256 lifeFloor;
		int256 periodCap;
		int256 periodFloor;

		// ObjectCodeOfPrepaymentModel objectCodeOfPrepaymentModel;
		// MarketObjectCodeOfRateReset marketObjectCodeOfRateReset;
	}
}