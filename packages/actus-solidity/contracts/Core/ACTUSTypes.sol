// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;

/**
 * Commit: https://github.com/actusfrf/actus-dictionary/commit/48338b4bddf34d3367a875020733ddbb97d7de8e
 * Date: 2019-10-23
 */


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

// Number of enum options should be limited to 256 (8 bits) such that 32 enums can be packed fit into 256 bits (bytes32)
enum Calendar {NC, MF}
enum BusinessDayConvention {NOS, SCF, SCMF, CSF, CSMF, SCP, SCMP, CSP, CSMP}
enum ContractPerformance {PF, DL, DQ, DF, MD, TD}
enum ContractReferenceType {CNT, CID, MOC, EID, CST}
enum ContractReferenceRole {UDL, FIL, SEL, COVE, COVI}
enum ContractRole {RPA, RPL, RFL, PFL, RF, PF, BUY, SEL, COL, CNO, UDL, UDLP, UDLM}
enum ContractType {PAM, ANN, NAM, LAM, LAX, CLM, UMP, CSH, STK, COM, SWAPS, SWPPV, FXOUT, CAPFL, FUTUR, OPTNS, CEG, CEC, CERTF}
enum CyclePointOfInterestPayment {B, E}
enum CyclePointOfRateReset {B, E}
enum DayCountConvention {AA, A360, A365, _30E360ISDA, _30E360, _28E336}
enum EndOfMonthConvention {SD, EOM}
enum CouponType {NOC, FIX, FCN, PRF}
//               0    1   2   3   4    5   6   7   8     9  10   11  12  13   14  15  16  17    18  19  20   21  22  23  24   25   26   27
enum EventType {NE, IED, FP, PR, PD, PRF, PY, PP, IP, IPCI, CE, RRF, RR, DV, PRD, MR, TD, SC, IPCB, MD, XD, STD, AD, XO, CPD, CFD, RFD, RPD}
enum FeeBasis {A, N}
// enum GuaranteedExposure {NO, NI, MV} // not implemented
// enum InterestCalculationBase {NT, NTIED, NTL} // not implemented
enum PenaltyType {O, A, N, I}
// enum PrepaymentEffect {N, A, M} // not implemented
enum ScalingEffect {_000, I00, _0N0, IN0}
// enum Seniority {S, J} // not implemented

struct ContractReference {
    bytes32 object;
    bytes32 object2; // workaround for solc bug (replace object and object2 with single bytes attribute)
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
    
    int256 quantity;
    int256 couponAmountFixed;
    int256 exerciseQuantity;
    int256 exerciseQuantityOrdered;
    int256 lastCouponDay;
    int256 marginFactor;
    int256 adjustmentFactor;
}

struct ANNTerms {
    ContractType contractType;
    Calendar calendar;
    ContractRole contractRole;
    DayCountConvention dayCountConvention;
    BusinessDayConvention businessDayConvention;
    EndOfMonthConvention endOfMonthConvention;
    ScalingEffect scalingEffect;
    PenaltyType penaltyType;
    FeeBasis feeBasis;
    // ContractPerformance contractPerformance; // state only
    // Seniority seniority; // not implemented
    // PrepaymentEffect prepaymentEffect; // not implemented
    // InterestCalculationBase interestCalculationBase; // not implemented

    address currency;
    address settlementCurrency;

    // bytes32 marketObjectCode; // not implemented
    bytes32 marketObjectCodeRateReset;
    // bytes32 marketObjectCodeOfScalingIndex; // not implemented

    uint256 contractDealDate;
    uint256 statusDate;
    uint256 initialExchangeDate;
    uint256 maturityDate;
    // uint256 terminationDate; // state only
    uint256 purchaseDate;
    uint256 capitalizationEndDate;
    // uint256 ammortizationDate; // not implemented
    // uint256 optionExerciseEndDate; // not implemented
    // uint256 nonPerformingDate; // state only
    uint256 cycleAnchorDateOfInterestPayment;
    // uint256 cycleAnchorDateOfInterestCalculationBase; // not implemented
    uint256 cycleAnchorDateOfRateReset;
    uint256 cycleAnchorDateOfScalingIndex;
    uint256 cycleAnchorDateOfFee;
    uint256 cycleAnchorDateOfPrincipalRedemption;
    // uint256 cycleAnchorDateOfOptionality; // not implemented

    int256 notionalPrincipal;
    int256 nominalInterestRate;
    int256 accruedInterest;
    int256 rateMultiplier;
    int256 rateSpread;
    int256 nextResetRate;
    int256 feeRate;
    int256 feeAccrued;
    int256 penaltyRate;
    int256 delinquencyRate;
    int256 premiumDiscountAtIED;
    int256 priceAtPurchaseDate;
    // int256 priceAtTerminationDate; // not implemented
    // int256 creditLineAmount; // not implemented
    // int256 scalingIndexAtStatusDate; // not implemented
    // int256 marketValueObserved; // not implemented
    int256 nextPrincipalRedemptionPayment;
    // int256 coverageOfCreditEnhancement;
    // int256 interestCalculationBaseAmount; // not implemented
    int256 lifeCap;
    int256 lifeFloor;
    int256 periodCap;
    int256 periodFloor;

    IP gracePeriod;
    IP delinquencyPeriod;
    // IP prepaymentPeriod; // not implemented
    // IP fixingPeriod; // not implemented

    IPS cycleOfInterestPayment;
    IPS cycleOfRateReset;
    IPS cycleOfScalingIndex;
    IPS cycleOfFee;
    IPS cycleOfPrincipalRedemption;
    // IPS cycleOfOptionality; // not implemented
    // IPS cycleOfInterestCalculationBase; // not implemented
}

struct CECTerms {
    ContractType contractType;
    Calendar calendar;
    ContractRole contractRole;
    DayCountConvention dayCountConvention;
    BusinessDayConvention businessDayConvention;
    EndOfMonthConvention endOfMonthConvention;
    ContractPerformance creditEventTypeCovered;
    FeeBasis feeBasis;
    // GuaranteedExposure guaranteedExposure; // not implemented

    uint256 statusDate;
    uint256 maturityDate;
    // uint256 exerciseDate; // state only

    int256 notionalPrincipal;
    int256 feeRate;
    // int256 exerciseAmount; // state only
    int256 coverageOfCreditEnhancement;

    // IP settlementPeriod; // not implemented

    // for simplification since terms are limited only two contract references
    // - make ContractReference top level and skip ContractStructure
    ContractReference contractReference_1;
    ContractReference contractReference_2;
}

struct CEGTerms {
    ContractType contractType;
    Calendar calendar;
    ContractRole contractRole;
    DayCountConvention dayCountConvention;
    BusinessDayConvention businessDayConvention;
    EndOfMonthConvention endOfMonthConvention;
    FeeBasis feeBasis;
    // ContractPerformance contractPerformance; // state only
    ContractPerformance creditEventTypeCovered;
    // GuaranteedExposure guaranteedExposure; // not implemented

    address currency;
    address settlementCurrency;

    uint256 contractDealDate;
    uint256 statusDate;
    uint256 maturityDate;
    uint256 purchaseDate;
    uint256 cycleAnchorDateOfFee;
    // uint256 exerciseDate; // state only
    // uint256 nonPerformingDate; // state only

    int256 notionalPrincipal;
    int256 delinquencyRate;
    int256 feeAccrued;
    int256 feeRate;
    int256 priceAtPurchaseDate;
    // int256 priceAtTerminationDate; // not implemented
    int256 coverageOfCreditEnhancement;
    // int256 exerciseAmount; // state only

    IP gracePeriod;
    IP delinquencyPeriod;
    // IP settlementPeriod; // not implemented

    IPS cycleOfFee;

    // for simplification since terms are limited only two contract references
    // - make ContractReference top level and skip ContractStructure
    ContractReference contractReference_1;
    ContractReference contractReference_2;
}

struct CERTFTerms {
    // "creatorID": "NN(,,1)",
    // "contractID": "NN",
    // "counterpartyID": "NN(,,1)",
    ContractType contractType;
    Calendar calendar;
    ContractRole contractRole;
    DayCountConvention dayCountConvention;
    BusinessDayConvention businessDayConvention;
    EndOfMonthConvention endOfMonthConvention;

    CouponType couponType;

    ContractPerformance contractPerformance;

    address currency;
    address settlementCurrency;

    bytes32 marketObjectCode;

    uint256 contractDealDate;
    uint256 statusDate;
    uint256 initialExchangeDate;
    uint256 maturityDate;
    uint256 nonPerformingDate;
    uint256 issueDate;

    uint256 cycleAnchorDateOfRedemption;
    uint256 cycleAnchorDateOfTermination;
    uint256 cycleAnchorDateOfCoupon;

    // uint256 lastCouponDay;

    int256 nominalPrice;
    int256 issuePrice;
    int256 delinquencyRate;

    int256 quantity;
    // int256 exerciseQuantity;
    // int256 exerciseQuantityOrdered;
    // int256 marginFactor;
    // int256 adjustmentFactor;
    int256 denominationRatio;

    int256 couponRate;
    int256 exerciseAmount;
    // int256 couponAmountFixed;

    IP gracePeriod;
    IP delinquencyPeriod;

    IP settlementPeriod;
    IP fixingPeriod;
    IP exercisePeriod;

    IPS cycleOfRedemption;
    IPS cycleOfTermination;
    IPS cycleOfCoupon;

    ContractReference contractReference;
}

struct PAMTerms {
    ContractType contractType;
    Calendar calendar;
    ContractRole contractRole;
    DayCountConvention dayCountConvention;
    BusinessDayConvention businessDayConvention;
    EndOfMonthConvention endOfMonthConvention;
    ScalingEffect scalingEffect;
    PenaltyType penaltyType;
    FeeBasis feeBasis;
    // ContractPerformance contractPerformance; // state only
    // Seniority seniority; // not implemented
    // PrepaymentEffect prepaymentEffect; // not implemented
    // CyclePointOfInterestPayment cyclePointOfInterestPayment; // not implemented
    // CyclePointOfRateReset cyclePointOfRateReset; // not implemented

    address currency;
    address settlementCurrency;

    // bytes32 marketObjectCode; // not implemented
    bytes32 marketObjectCodeRateReset;
    // bytes32 marketObjectCodeOfScalingIndex; // not implemented

    uint256 contractDealDate;
    uint256 statusDate;
    uint256 initialExchangeDate;
    uint256 maturityDate;
    // uint256 terminationDate; // state only
    uint256 purchaseDate;
    uint256 capitalizationEndDate;
    // uint256 optionExerciseEndDate; // not implemented
    // uint256 nonPerformingDate; // state only
    uint256 cycleAnchorDateOfInterestPayment;
    uint256 cycleAnchorDateOfRateReset;
    uint256 cycleAnchorDateOfScalingIndex;
    uint256 cycleAnchorDateOfFee;
    // uint256 cycleAnchorDateOfOptionality; // not implemented

    int256 notionalPrincipal;
    int256 nominalInterestRate;
    int256 accruedInterest;
    int256 rateMultiplier;
    int256 rateSpread;
    int256 nextResetRate;
    int256 feeRate;
    int256 feeAccrued;
    int256 penaltyRate;
    int256 delinquencyRate;
    int256 premiumDiscountAtIED;
    int256 priceAtPurchaseDate;
    // int256 priceAtTerminationDate; // not implemented
    // int256 creditLineAmount; // not implemented
    // int256 scalingIndexAtStatusDate; // not implemented
    // int256 marketValueObserved; // not implemented
    int256 lifeCap;
    int256 lifeFloor;
    int256 periodCap;
    int256 periodFloor;
    
    IP gracePeriod;
    IP delinquencyPeriod;
    // IP prepaymentPeriod; // not implemented
    // IP fixingPeriod; // not implemented

    IPS cycleOfInterestPayment;
    IPS cycleOfRateReset;
    IPS cycleOfScalingIndex;
    IPS cycleOfFee;
    // IPS cycleOfOptionality; // not implemented
}
