pragma solidity ^0.5.2;


/**
 * @title ACTUSTypes
 * @notice Contains all type definitions for ACTUS
 */
contract ACTUSTypes {

    // int256 constant INT256_MIN = int256((uint256(1) << 255));
    // int256 constant INT256_MAX = int256(~((uint256(1) << 255)));
    // uint256 constant UINT256_MIN = 0;
    // uint256 constant UINT256_MAX = ~uint256(0);
    // int256 constant DOUBLE_NULL = INT256_MIN;

    uint256 constant public PRECISION = 18;
    int256 constant public ONE_POINT_ZERO = 1 * 10 ** 18;

    uint256 constant MAX_CYCLE_SIZE = 16;
    uint256 constant MAX_EVENT_SCHEDULE_SIZE = 64; // 4x MAX_CYCLE_SIZE for IP, RR, FP and SC

    // IPS
    enum P {D, W, M, Q, H, Y} // P=[D=Days, W=Weeks, M=Months, Q=Quarters, H=Halfyear, Y=Year]
    enum S {LONG, SHORT} // S=[+=long stub,- short stub, {} if S empty then - for short stub]
    struct IPS {
        uint256 i; // I=Integer
        P p;
        S s;
        bool isSet;
    }

    struct IP {
        uint256 i;
        P p;
        bool isSet;
    }

    //               0   1   2   3   4    5     6     7   8   9  10  11  12  13   14  15   16   17  18  19   29  21  22
    enum EventType {AD, CD, DV, XD, FP, IED, IPCB, IPCI, IP, MR, MD, PY, PD, PRF, PP, PR, PRD, RRF, RR, SC, STD, TD, CE}
    enum Calendar {NoCalendar, MondayToFriday} // Custom: custom implementation of calendar
    enum BusinessDayConvention {NULL, SCF, SCMF, CSF, CSMF, SCP, SCMP, CSP, CSMP}
    enum ClearingHouse {YES, NO} // required ?
    enum ContractRole {RPA, RPL, LG, ST, RFL, PFL, BUY, SEL, GUA, OBL} // required ?
    enum ContractPerformance {PF, DL, DQ, DF} // Default: PF
    enum ContractType {PAM, ANN, NAM, LAM, LAX, CLM, UMP, CSH, STK, COM, SWAPS, SWPPV, FXOUT, CAPFL, FUTUR, OPTNS, CEG, CEC} // required ?
    enum CyclePointOfInterestPayment {EndOf, BeginningOf} // Default: EndOf
    enum CyclePointOfRateReset {BeginningOf, EndOf} // Default: BeginningOf
    enum CycleTriggerOfOptionality {IP, PR, RR}
    enum DayCountConvention {A_AISDA, A_360, A_365, _30E_360ISDA, _30E_360, _30_360, BUS_252} // required ?
    enum EndOfMonthConvention {EOM, SD} // Default: SD
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
    enum ContractReferenceType {CT, CID, MOC, LEI, CS}
    enum ContractReferenceRole {UDY, FL, SL, CVE, CVI}

    struct ContractReference {
        bytes32 object;
        ContractReferenceType contractReferenceType;
        ContractReferenceRole contractReferenceRole;
    }

    struct State {
        ContractPerformance contractPerformance;

        uint256 statusDate;
        uint256 nonPerformingDate;
        uint256 maturityDate;
        uint256 executionDate;

        int256 notionalPrincipal;
        // int256 notionalPrincipal2;
        int256 accruedInterest;
        int256 feeAccrued;
        int256 nominalInterestRate;
        // int256 interestCalculationBase;
        int256 interestScalingMultiplier;
        int256 notionalScalingMultiplier;
        int256 nextPrincipalRedemptionPayment;
        int256 executionAmount;
    }

    // Subset of the ACTUS terms object (contains only attributes which are used in POFs and STFs)
    struct LifecycleTerms {
        Calendar calendar;
        ContractRole contractRole;
        DayCountConvention dayCountConvention;
        BusinessDayConvention businessDayConvention;
        EndOfMonthConvention endOfMonthConvention;
        ScalingEffect scalingEffect;
        PenaltyType penaltyType;
        FeeBasis feeBasis;
        ContractPerformance creditEventTypeCovered;
        ContractReference contractReference_1;
        ContractReference contractReference_2;

        address currency;
        address settlementCurrency;

        bytes32 marketObjectCodeRateReset;

        uint256 statusDate;
        uint256 maturityDate;

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
        int256 nextPrincipalRedemptionPayment;
        int256 coverageOfCreditEnhancement;

        IP gracePeriod;
        IP delinquencyPeriod;

        int256 lifeCap;
        int256 lifeFloor;
        int256 periodCap;
        int256 periodFloor;
    }

    // Subset of the ACTUS terms object (contains only attributes which are used in the schedule generation)
    struct GeneratingTerms {
        ScalingEffect scalingEffect;

        uint256 contractDealDate;
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
        uint256 cycleAnchorDateOfPrincipalRedemption;

        IPS cycleOfInterestPayment;
        IPS cycleOfRateReset;
        IPS cycleOfScalingIndex;
        IPS cycleOfFee;
        IPS cycleOfPrincipalRedemption;

        IP gracePeriod;
        IP delinquencyPeriod;
    }

    // ACTUS terms object
    struct Terms {
        ContractType contractType;
        Calendar calendar;
        ContractRole contractRole;
        DayCountConvention dayCountConvention;
        BusinessDayConvention businessDayConvention;
        EndOfMonthConvention endOfMonthConvention;
        ScalingEffect scalingEffect;
        PenaltyType penaltyType;
        FeeBasis feeBasis;
        ContractPerformance creditEventTypeCovered;

        ContractReference contractReference_1;
        ContractReference contractReference_2;

        address currency;
        address settlementCurrency;

        bytes32 creatorID;
        bytes32 counterpartyID;
        bytes32 marketObjectCodeRateReset;

        uint256 contractDealDate;
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
        uint256 cycleAnchorDateOfPrincipalRedemption;

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
        int256 nextPrincipalRedemptionPayment;
        int256 coverageOfCreditEnhancement;

        IPS cycleOfInterestPayment;
        IPS cycleOfRateReset;
        IPS cycleOfScalingIndex;
        IPS cycleOfFee;
        IPS cycleOfPrincipalRedemption;

        IP gracePeriod;
        IP delinquencyPeriod;

        int256 lifeCap;
        int256 lifeFloor;
        int256 periodCap;
        int256 periodFloor;
    }
}
