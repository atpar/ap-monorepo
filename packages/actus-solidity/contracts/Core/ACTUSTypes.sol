pragma solidity ^0.6.4;


/**
 * @title ACTUSTypes
 * @notice Contains all type definitions for ACTUS. See ACTUS-Dictionary for definitions
 */
contract ACTUSTypes {

    // constants used throughout
    uint256 constant public PRECISION = 18;
    int256 constant public ONE_POINT_ZERO = 1 * 10 ** 18;
    uint256 constant public MAX_CYCLE_SIZE = 120;
    uint256 constant public MAX_EVENT_SCHEDULE_SIZE = 120;

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

    //               0    1   2   3   4    5   6   7   8     9  10   11  12  13   14  15  16  17    18  19  20   21  22
    enum EventType {NE, IED, FP, PR, PD, PRF, PY, PP, IP, IPCI, CE, RRF, RR, DV, PRD, MR, TD, SC, IPCB, MD, XD, STD, AD}
    enum Calendar {NC, MF}
    enum BusinessDayConvention {NOS, SCF, SCMF, CSF, CSMF, SCP, SCMP, CSP, CSMP}
    enum ClearingHouse {Y, N}
    enum ContractRole {RPA, RPL, RFL, PFL, RF, PF, BUY, SEL, COL, CNO, UDL, UDLP, UDLM}
    enum ContractPerformance {PF, DL, DQ, DF, MD, TD}
    enum ContractType {PAM, ANN, NAM, LAM, LAX, CLM, UMP, CSH, STK, COM, SWAPS, SWPPV, FXOUT, CAPFL, FUTUR, OPTNS, CEG, CEC} // required ?
    enum CyclePointOfInterestPayment {B, E} // or E, B?
    enum CyclePointOfRateReset {B, E}
    enum DayCountConvention {AA, A360, A365, _30E360ISDA, _30E360, _28E336}
    enum EndOfMonthConvention {SD, EOM}
    enum FeeBasis {A, N}
    enum InterestCalculationBase {NT, NTIED, NTL}
    enum OptionExerciseType {E, B, A}
    enum OptionType {C, P, CP}
    enum PenaltyType {O, A, N, I}
    enum PrepaymentEffect {N, A, M}
    enum ScalingEffect {_000, I00, _0N0, IN0}
    enum Seniority {S, J}
    enum Unit {BRL, BSH, GLN, CUU, MWH, PND, STN, TON, TRO}
    enum ContractReferenceType {CNT, CID, MOC, EID, CST}
    enum ContractReferenceRole {UDL, FIL, SEL, COVE, COVI}

    struct ContractReference {
        bytes32 object;
        ContractReferenceType _type;
        ContractReferenceRole role;
    }

    struct State {
        ContractPerformance contractPerformance;

        uint256 statusDate;
        uint256 nonPerformingDate;
        uint256 maturityDate;
        uint256 exerciseDate;
        uint256 terminationDate;

        int256 notionalPrincipal;
        // int256 notionalPrincipal2;
        int256 accruedInterest;
        // int256 accruedInterest2;
        int256 feeAccrued;
        int256 nominalInterestRate;
        // int256 nominalInterestRate2;
        // int256 interestCalculationBaseAmount;
        int256 interestScalingMultiplier;
        int256 notionalScalingMultiplier;
        int256 nextPrincipalRedemptionPayment;
        int256 exerciseAmount;
    }

    // subset of the ACTUS terms object
    // contains only attributes which are used in POFs and STFs
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
        int256 lifeCap;
        int256 lifeFloor;
        int256 periodCap;
        int256 periodFloor;

        IP gracePeriod;
        IP delinquencyPeriod;

        // for simplification since terms are limited only two contract references
        // - make ContractReference top level and skip ContractStructure
        ContractReference contractReference_1;
        ContractReference contractReference_2;
    }

    // subset of the ACTUS terms object
    // contains only attributes which are used in the schedule generation
    struct GeneratingTerms {
        ScalingEffect scalingEffect;

        uint256 contractDealDate;
        uint256 statusDate;
        uint256 initialExchangeDate;
        uint256 maturityDate;
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

        address currency;
        address settlementCurrency;

        bytes32 marketObjectCodeRateReset;

        uint256 contractDealDate;
        uint256 statusDate;
        uint256 initialExchangeDate;
        uint256 maturityDate;
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
        int256 lifeCap;
        int256 lifeFloor;
        int256 periodCap;
        int256 periodFloor;

        IPS cycleOfInterestPayment;
        IPS cycleOfRateReset;
        IPS cycleOfScalingIndex;
        IPS cycleOfFee;
        IPS cycleOfPrincipalRedemption;

        IP gracePeriod;
        IP delinquencyPeriod;

        // for simplification since terms are limited only two contract references
        // - make ContractReference top level and skip ContractStructure
        ContractReference contractReference_1;
        ContractReference contractReference_2;
    }
}
