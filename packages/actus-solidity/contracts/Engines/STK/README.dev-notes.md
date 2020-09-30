## The Attributes, the Terms and the State for STK

actus-dict.identifier      | Acronym | Rules     | actus-sol.Terms                      | actus-sol.State
-------------------------- |---------|-----------|--------------------------------------|--------------------------
statusDate                 | (SD)    |  NN(,,1)  | STKTerms.statusDate                  | State.statusDate
contractPerformance        | (PRF)   |  x(,,1)   |                                      | State.contractPerformance
nonPerformingDate          | (NPD)   |  x(,,1)   |                                      | State.nonPerformingDate
                           |         |           |                                      |
contractID                 | (CID)   |  NN       |                                      |
contractType               | (CT)    |  NN       | STKTerms.contractType                |
contractDealDate           | (CDD)   |  NN(,,1)  | STKTerms.contractDealDate            |
marketObjectCode           | (MOC)   |  x        | //STKTerms.marketObjectCode          |
seniority                  | (SEN)   |  x(,,1)   | //STKTerms.seniority                 |
currency                   | (CUR)   |  NN       | STKTerms.currency                    |
settlementCurrency         | (CURS)  |  x        | STKTerms.settlementCurrency          |
calendar                   | (CLDR)  |  x        | STKTerms.calendar,dayCountConvention |
businessDayConvention      | (BDC)   |  x        | STKTerms.businessDayConvention,      |
endOfMonthConvention       | (EOMC)  |  x        | STKTerms.endOfMonthConvention        |
                           |         |           |                                      |
creatorID                  | (CRID)  |  NN(,,1)  |                                      |
contractRole               | (CNTRL) |  NN       | STKTerms.contractRole                |
counterpartyID             | (CPID)  |  NN(,,2)  |                                      |
                           |         |           |                                      |
issueDate                  | (ID)    |  NN       | STKTerms.issueDate                   |
issuePrice                 | (IPR)   |  NN       | STKTerms.issuePrice                  |
notionalPrincipal          | (NT)    |  NN       | +STKTerms.notionalPrincipal          | State.notionalPrincipal
quantity                   | (QT)    |  NN(,,3)  | STKTerms.quantity                    | State.quantity
                           |         |           |                                      |
purchaseDate               | (PRD)   |  NN       | STKTerms.purchaseDate                |
priceAtPurchaseDate        | (PPRD)  |  NN       | STKTerms.priceAtPurchaseDate         |
nominalPrice               | (NPR)   |  NN       | STKTerms.nominalPrice                |
                           |         |           |                                      |
                           |         |           |                                      | >> +State.dividendDeclarationDate
                           |         |           |                                      | >> +State.lastDividendDeclarationDate
dividendPaymentAmount      | (DPA)   |  x(1,0,)  | +STKTerms.dividendPaymentAmount      | +State.dividendPaymentAmount
dividendRecordPeriod       | (DRP)   |  x(1,1,)  | +STKTerms.dividendRecordPeriod       |
dividendExDate             | (DED)   |  x(1,1,)  | +STKTerms.dividendExDate             | +State.dividendExDate
dividendPaymentPeriod      | (DPP)   |  x(1,1,)  | +STKTerms.dividendPaymentPeriod      |
dividendPaymentDate        | (DPD)   |  x(1,1,)  | +STKTerms.dividendPaymentDate        | +State.dividendPaymentDate
cycleAnchorDateOfDividend  | (DANX)  |  NN(1,1,) | +STKTerms.cycleAnchorDateOfDividend  |
cycleOfDividend            | (DCL)   |  x(1,0,)  | +STKTerms.cycleOfDividend            |
                           |         |           |                                      |
splitRatio                 | (SRA)   |  x        | +STKTerms.splitRatio                 | +State.splitRatio
splitRecordPeriod          | (SRP)   |  x        | +STKTerms.splitRecordPeriod          |
splitExDate                | (SED)   |  x        | +STKTerms.splitExDate                | +State.splitExDate
+splitSettlementPeriod     | (+SSP)  |           | +STKTerms.splitSettlementPeriod      |
                           |         |           | +STKTerms.splitSettlementDate        | +State.splitSettlementDate
                           |         |           |                                      |
redeemableByIssuer         | (RBI)   |  x(7,0,)  | +STKTerms.redeemableByIssuer         |
redemptionPrice            | (RPR)   |  NN(7,1,) | +STKTerms.redemptionPrice            | >> State.nextPrincipalRedemptionPayment
redemptionRecordPeriod     | (RRP)   |  x        | +STKTerms.redemptionRecordPeriod     |
redemptionExDate           | (RED)   |  x        | +STKTerms.redemptionExDate           | +State.redemptionExDate
redemptionPaymentPeriod    | (RPP)   |  x        | +STKTerms.redemptionPaymentPeriod    |
redemptionPaymentDate      | (RPD)   |  x        | +STKTerms.redemptionPaymentDate      | +State.redemptionPaymentDate
                           |         |           |                                      |
terminationDate            | (TD)    |  x(6,0,1) | +STKTerms.terminationDate            | State.terminationDate
priceAtTerminationDate     | (PTD)   |  NN(6,1,1)| STKTerms.priceAtTerminationDate      |
                           |         |           |                                      |
marketValueObserved        | (MVO)   |  x        |                                      |
settlementPeriod           | (STP)   |  x        |                                      |
                           |         |           |                                      | (1) >> State.exerciseDate, State.exerciseAmount, State.exerciseQuantity

> Notes:
* "+" - a new property added (to the _Terms_, _State_ or dict)
* "//" - a property commented out (in the _Terms_ or _State_)
* ">>" - a state param is dependant upon a term
* (1) _State.exerciseQuantity_ is missing in the actus-dict list of the state params
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
- Event: AD, ID, DDD, DED, SDD, SSD, RDD, REX, CE, IED   
  POF: 0
  // it could be for ID or IED: X_cur_to_curs(t) * Sign(CNTRL) * IPR * QT
- Event: TD
  POF: X_cur_to_curs(t) * Sign(CNTRL) * PTD * Qt // PTD - terms.priceAtTerminationDate
- Event: DPD
  POF: X_cur_to_curs(t) * Sign(CNTRL) * Dpa
- Event: RPD
  POF: X_cur_to_curs(t) * Sign(CNTRL) * RPR * Xa // Xa - exercise amount , RPR - redemptionPrice

## State transition function
- Event: AD, TD, DED, RED, IED
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
  STF: Xa = riskFactorObserver("${CID}_RXA", t), Sd = t
   // Xa - exercise amount, RXA - redemption exercise amount ??

- Event: RPD
  STF: Qt = Qt - Xa, Xa = 0, Sd = t

- Event: CE
  STF: Ipac = Ipac + Y(Sd,t)*Ipnr*Nt, Sd = t
