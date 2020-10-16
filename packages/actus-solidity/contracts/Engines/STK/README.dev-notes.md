## The Attributes, the Terms and the State for STK

actus-dict:: identifier    Acronym  Rules     | ACTUSTypes.sol::Terms       | ACTUSTypes.sol::State
----------------------------------------------|-----------------------------|--------------------------
statusDate                 (SD)      NN(,,1)  | statusDate                  | statusDate
                                              |                             |
creatorID                  (CRID)    NN(,,1)  |                             |
contractID                 (CID)     NN       |                             |
counterpartyID             (CPID)    NN(,,2)  |                             |
                                              |                             |
businessDayConvention      (BDC)     x        | businessDayConvention       |
calendar                   (CLDR)    x        | calendar,dayCountConvention |
contractDealDate           (CDD)     NN(,,1)  | contractDealDate            |
contractPerformance        (PRF)     x(,,1)   |                             | contractPerformance
contractRole               (CNTRL)   NN       | contractRole                |
contractType               (CT)      NN       | contractType                |
currency                   (CUR)     NN       | currency                    |
endOfMonthConvention       (EOMC)    x        | endOfMonthConvention        |
marketObjectCode           (MOC)     x        | //marketObjectCode          |
nonPerformingDate          (NPD)     x(,,1)   |                             | nonPerformingDate
seniority                  (SEN)     x(,,1)   | //seniority                 |
settlementCurrency         (CURS)    x        | settlementCurrency          |
                                              |                             |
issueDate                  (ISD)     NN       | issueDate                   |
issuePrice                 (ISPR)    NN       | issuePrice                  |
notionalPrincipal          (NT)      NN       | notionalPrincipal           | notionalPrincipal
quantity                   (QT)      NN(,,3)  | quantity                    | quantity
                                              |                             |
nominalPrice               (NOPR)    NN       | nominalPrice                |
purchaseDate               (PRD)     NN       | purchaseDate                |
priceAtPurchaseDate        (PPRD)    NN       | priceAtPurchaseDate         |
                                              |                             |
cycleAnchorDateOfDividend  (DIANX)   NN(1,1,) | cycleAnchorDateOfDividend   |
cycleOfDividend            (DICL)    x(1,0,)  | cycleOfDividend             |
dividendPaymentAmount      (DIPA)    x(1,0,)  |                             | dividendPaymentAmount
dividendRecordPeriod       (DIRP)    x(1,1,)  | dividendRecordPeriod        |
dividendExDate             (DIEX)    x(1,1,)  |                             | //dividendExDate
dividendPaymentPeriod      (DIPP)    x(1,1,)  | dividendPaymentPeriod       |
dividendPaymentDate        (DIPD)    x(1,1,)  |                             | //dividendPaymentDate
dividendFixingDate         (DIFD)             |                             | //dividendFixingDate
lastDividendFixingDate     (LDIFD)   x        |                             | lastDividendFixingDate
                                              |                             |
splitRatio                 (SPR)     x        |                             | splitRatio
splitSettlementPeriod      (SPSP)    x        | splitSettlementPeriod       |
splitSettlementDate                           |                             | //splitSettlementDate
                                              |                             |
redeemableByIssuer         (REBI)    x(7,0,)  | redeemableByIssuer          |
redemptionPrice            (REPR)    NN(7,1,) | redemptionPrice             |
redemptionRecordPeriod     (RERP)    x        | redemptionRecordPeriod      |
redemptionExDate           (REXD)    x        |                             | //redemptionExDate
redemptionPaymentPeriod    (REPP)    x        | redemptionPaymentPeriod     |
redemptionPaymentDate      (REPD)    x        |                             | //redemptionPaymentDate
                                              |                             |
terminationDate            (TD)      x(6,0,1) |                             | terminationDate
priceAtTerminationDate     (PTD)     NN(6,1,1)| //priceAtTerminationDate    |
                                              |                             |
marketValueObserved        (MV)      x        |                             |
                                              |                             | >>exerciseAmount
                                              |                             | >>exerciseQuantity
> Notes:
* "//" - a property commented out (unused in the _Terms_ or _State_)
* ">>" - a state param is indirectly affected

##  STK events:
  - AD: Monitoring
  - ISS: Issue Date
  - TD: Termination Date
  - DIF: Dividend Declaration Date
  - DIX: Dividend Ex Date
  - DIP: Dividend Payment Date
  - SPF: Split Declaration Date
  - SPS: Split Settlement Date
  - REF: Redemption Declaration Date
  - REX: Redemption Ex Date
  - REP: Redemption Payment Date
  - CE: Credit Event

## Payof Function
- Event: AD, ISS, DIF, DIX, SPF, SPS, REF, REX, CE, IED   
  POF: 0

- Event: DIP
  POF: X_cur_to_curs(t) * Sign(CNTRL) * Dipa
  // Dipa - dividendPaymentAmount (the state)

- Event: REP
  POF: X_cur_to_curs(t) * Sign(CNTRL) * REPR * Exa
  // Exa - exercise amount (the state)
  // ... or exercise quantity ?

- Event: TD
  POF: X_cur_to_curs(t) * Sign(CNTRL) * PTD * Qt

## State transition function
- Event: AD, DIX, REX, CE, TD(?)
  STF: Sd = t

- Event: ISS
  STF: Nt = NT, Qt = QT, Sd = t

- Event: DIF
  STF: Ldifd = t, Dipa = riskFactorObserver("${CID}_DIP", t), Sd = t
  // Should not be "${CID}_DIPA" ?

- Event: DIP
  STF: Dipa = 0, Sd = t

- Event: SPF
  STF: Spr = riskFactorObserver("${CID}_SRA", t), Sd = t
  // Spr - splitRatio (the state)

- Event: SPS
  STF: Qt = Spr * Qt, Spr = 0, Sd = t

- Event: REF
  STF: Exa = riskFactorObserver("${CID}_REXA", t), Sd = t
   // Exa - exercise amount (or quantity?)
   // REXA - "redemption exercise quantity"

- Event: REP
  STF: Qt = Qt - Xq, Xq = 0, Sd = t

// TODO: make the actor generate DIX and DIP events
// TODO: make the actor generate DIX and DIP events

Qs to latest specs
STK STF for DIF:
  LDIFD - all letters are capital, shall be the 1st only
  Should not be "DIPA" (not "DIP") in concat?
STK STF for REF:
  Exa (exercise amount) applied. Shall not be Exq (exercise quantity)?  
  In any case, neither EXA nor EXQ mentioned as applicable attribute for STK in actus-dictionary
  
