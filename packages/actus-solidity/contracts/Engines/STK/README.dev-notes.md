## The Attributes, the Terms and the State for STK

actus-dict.identifier      | Acronym | Rules     | ACTUSTypes.sol::Terms       | ACTUSTypes.sol::State
-------------------------- |---------|-----------|-----------------------------|--------------------------
statusDate                 | (SD)    |  NN(,,1)  | statusDate                  | statusDate
                           |         |           |                             |
creatorID                  | (CRID)  |  NN(,,1)  |                             |
contractID                 | (CID)   |  NN       |                             |
counterpartyID             | (CPID)  |  NN(,,2)  |                             |
                           |         |           |                             | >>exerciseDate
                           |         |           |                             | >>exerciseAmount
                           |         |           |                             | >>exerciseQuantity
businessDayConvention      | (BDC)   |  x        | businessDayConvention,      |
calendar                   | (CLDR)  |  x        | calendar,dayCountConvention |
contractDealDate           | (CDD)   |  NN(,,1)  | contractDealDate            |
contractPerformance        | (PRF)   |  x(,,1)   |                             | contractPerformance
contractRole               | (CNTRL) |  NN       | contractRole                |
contractType               | (CT)    |  NN       | contractType                |
currency                   | (CUR)   |  NN       | currency                    |
endOfMonthConvention       | (EOMC)  |  x        | endOfMonthConvention        |
marketObjectCode           | (MOC)   |  x        | //marketObjectCode          |
nonPerformingDate          | (NPD)   |  x(,,1)   |                             | nonPerformingDate
seniority                  | (SEN)   |  x(,,1)   | //seniority                 |
settlementCurrency         | (CURS)  |  x        | settlementCurrency          |
                           |         |           |                             |
issueDate                  | (ID)    |  NN       | issueDate                   |
issuePrice                 | (IPR)   |  NN       | issuePrice                  |
notionalPrincipal          | (NT)    |  NN       | +notionalPrincipal          | notionalPrincipal
quantity                   | (QT)    |  NN(,,3)  | quantity                    | quantity
                           |         |           |                             |
nominalPrice               | (NPR)   |  NN       | nominalPrice                |
purchaseDate               | (PRD)   |  NN       | purchaseDate                |
priceAtPurchaseDate        | (PPRD)  |  NN       | priceAtPurchaseDate         |
                           |         |           |                             |
cycleAnchorDateOfDividend  | (DANX)  |  NN(1,1,) | +cycleAnchorDateOfDividend  | >> +lastDividendDeclarationDate
cycleOfDividend            | (DCL)   |  x(1,0,)  | +cycleOfDividend            |
dividendPaymentAmount      | (DPA)   |  x(1,0,)  |                             | +dividendPaymentAmount
dividendRecordPeriod       | (DRP)   |  x(1,1,)  | +dividendRecordPeriod       |
dividendExDate             | (DED)   |  x(1,1,)  |                             |
dividendPaymentPeriod      | (DPP)   |  x(1,1,)  | +dividendPaymentPeriod      |
dividendPaymentDate        | (DPD)   |  x(1,1,)  |                             |
                           |         |           |                             |
splitRatio                 | (SRA)   |  x        |                             | +splitRatio
splitRecordPeriod          | (SRP)   |  x        | +splitRecordPeriod          |
splitExDate                | (SED)   |  x        |                             | +splitExDate
+splitSettlementPeriod     | (+SSP)  |           | +splitSettlementPeriod      |
                           |         |           |                             |
                           |         |           |                             |
redeemableByIssuer         | (RBI)   |  x(7,0,)  | +redeemableByIssuer         |
redemptionPrice            | (RPR)   |  NN(7,1,) | +redemptionPrice            |
                           |         |           |                             | >> nextPrincipalRedemptionPayment ?
redemptionRecordPeriod     | (RRP)   |  x        | +redemptionRecordPeriod     |
redemptionExDate           | (RED)   |  x        |                             | //redemptionExDate
redemptionPaymentPeriod    | (RPP)   |  x        | +redemptionPaymentPeriod    |
redemptionPaymentDate      | (RPD)   |  x        |                             | //redemptionPaymentDate
                           |         |           |                             |
terminationDate            | (TD)    |  x(6,0,1) |                             | //terminationDate
priceAtTerminationDate     | (PTD)   |  NN(6,1,1)| //priceAtTerminationDate    |
                           |         |           |                             |
marketValueObserved        | (MVO)   |  x        |                             |
settlementPeriod           | (STP)   |  x        |                             |

> Notes:
* "+" - a newly added property (to the _Terms_, _State_ or dict)
* "//" - a property commented out (unused in the _Terms_ or _State_)
* ">>" - a state param is indirectly dependant upon a term but not
* Not applicable State params:
accruedInterest, accruedInterest2, feeAccrued, interestCalculationBaseAmount, interestScalingMultiplier, maturityDate, 
nominalInterestRate, nominalInterestRate2, notionalPrincipal2, notionalScalingMultiplier

### terms/state_params mentioned or discussed in misc explanations:
  - exercise amount (XA)
  - nominalPrice (NPR)
  - issuePrice (IPR)
  - quantity (QT)
    we will interpret quantity as token supply, similar to CERTF
  - dividends params, defined on the (optional) Dividend Declaration Date (DDD)
    - dividendPaymentAmount (DPA)
    - dividendRecordPeriod (DRP)
    - dividendExDate (DED)
        DED = DDD + DRP
    - dividendPaymentPeriod (DPP)
    - dividendPaymentDate (DPD)
        DPD = DDD + DPP
    - cycleAnchorDateOfDividend (DANX)
    - cycleOfDividend (DCL)
    - lastDividendDeclarationDate (DLDD)
  - Split terms, defined on the optional Split Declaration Date (SDD) event
    - splitRatio (SRA)
    - splitRecordPeriod (SRP)
    - splitExDate (SED)
        SED = SDD + SRP
    - splitSettlementPeriod (SSP)
    - Split Settlement Date (SSD)
        SSD = SDD + SRP
  - redeemableByIssuer (RBI)
    if "Y", then the issuer can at any time insert the Redemption Declaration Date (RDD) event
  - Redemption params, defined on the (optional) Redemption Declaration Date (RDD) event:
    - redemptionPrice (RPR)
    - numberOfShares (to be redeemed)
    - redemptionRecordPeriod (RRP)
    - redemptionExDate (RED)
        RED = RDD + RED
    - redemptionPaymentPeriod (RPP)
    - redemptionPaymentDate (RPD)
        RPD = RDD + RPD
  - Termination params, if applicable
    - terminationDate (TD)
    - priceAtTerminationDate (PTD)

##  STK events:
  - AD: Monitoring
     > Same as PAM
  - ID: Issue Date
     > Issuer issues STK by selling quantity shares worth nominalPrice at issuePrice (we will interpret quantity as token supply, similar to CERTF)
     At issuance, issuer fixes with terms: a dividend schedule (optional), right to redeem shares, etc...
     Dividend/redemption/split terms are optional and if not defined, no DDD/RDD/SDD events get generated.
  - IED: Initial exchange date
     > not applicable (out of the scope)
  - TD: Termination Date
     > Same as PAM
     > If a contract is sold before MD (for example a bond on the secondary market) this date has to be set.
     It refers to the date at which the payment (of PTD) and transfer of the security happens.
     In other words, TD - if set - takes the role otherwise MD has from a cash flow perspective.
     If not otherwise set, STK is a perpetual instrument so no natural schedule end date (TD)
  - DDD: Dividend Declaration Date
     > The timestamp of the next DDD event (if scheduled).
     The management fixes and announces the next upcoming dividend payment x
     Creates also DED and DPD events according to dividendRecordPeriod, dividendPaymentPeriod
  - DED: Dividend Ex Date
     > Date from which new shareholders are not considered for the next dividend distribution
       For simplicity, Dividend Ex Date = Dividend Declaration Date + dividendRecordPeriod
  - DPD: Dividend Payment Date
     > The timestamp of the next DPD event (if scheduled).
     For simplicity, Dividend Payment Date = Dividend Declaration Date + dividendPaymentPeriod
  - SDD: Split Declaration Date
     > Declaration of a stock split or reverse split
     With splitDeclarationDate event issuer defines the splitRatio to be applied in the upcoming split
     Creates splitExDate and splitSettlementDate events according to splitRecordPeriod and splitSettlementPeriod terms
  - SED: Split Ex Date
     > The timestamp of the next SED event (if scheduled).
     The split ex-date is the date the stock starts trading at the new adjusted split price
     At splitExDate event, shares in circulation are fixed
  - SSD: Split Settlement Date
     > The timestamp of the next SSD event (if scheduled).
     At following splitSettlementDate event each share/token holder's balance is adjusted by the splitRatio
  - RDD: Redemption Declaration Date
     > Declaration of the redemption of units of an instrument by the initiating party
     if redeemableByIssuer=Y then the issuer can at any time insert the event
     At redemptionDeclarationDate event the number of shares to be redeemed is fixed by the issuer
     Creates a redemptionExDate and redemptionPaymentDate events and adds them to the schedule.
  - RED: Redemption Ex Date
     > The timestamp of the next RED event (if scheduled).
     Shareholders fixed who will have to sell back a number of shares to issuer proportional to their current shareholding at the redemptionPrice
  - RPD: Redemption Payment Date
     > The timestamp of the next RPD event (if scheduled).
     Announced number of shares are bought back by issuer from identified shareholders by swapping respective tokens against the numberOfShares*redemptionPrice
     Date on which the redemption value (normally the par value) of a debt instrument is paid to its holder by its issuer.
  - CE: Credit Event
     > Same as PAM

### Notes:
    - lets not yet "connect" the asset/engine/actor logic with action on the connected token representing the shares for now.
        we thus trust the operator of a shares contract to separately call e.g. a mint/burn function in combination with a splitSettlementDate event

### Payments
Payments occur on: DPD, RPD, TD

## Payof Function
- Event: AD, ID, DDD, DED, SDD, SSD, RDD, RED, CE, IED   
  POF: 0
  // it could be for ID or IED: X_cur_to_curs(t) * Sign(CNTRL) * IPR * QT
- Event: TD
  POF: X_cur_to_curs(t) * Sign(CNTRL) * PTD * Qt // PTD - terms.priceAtTerminationDate
- Event: DPD
  POF: X_cur_to_curs(t) * Sign(CNTRL) * Dpa
- Event: RPD
  POF: X_cur_to_curs(t) * Sign(CNTRL) * RPR * Xa // Xa - exercise amount , RPR - redemptionPrice

## State transition function
- Event: AD, DED, SED, RED, CE, TD(?)
  STF: Sd = t

- Event: ID
  STF: sets Nt = NT, Qt = QT, Sd = t

- Event: DDD
  STF: Dldd = t, Dpa = riskFactorObserver("${CID}_DPD", t), Sd = t

- Event: DPD
  STF: Dpa = 0, Sd = t

- Event: SDD
  STF: Sra = riskFactorObserver("${CID}_SRA", t), Sd = t
  // Sra - splitRatio

- Event: SSD
  STF: Qt = Sra * Qt, Sra = 0, Sd = t

- Event: RDD
  STF: Xq = riskFactorObserver("${CID}_RXQ", t), Sd = t
   // Xq - exercise quantity, RXQ - redemption exercise quantity

- Event: RPD
  STF: Qt = Qt - Xq, Xq = 0, Sd = t
