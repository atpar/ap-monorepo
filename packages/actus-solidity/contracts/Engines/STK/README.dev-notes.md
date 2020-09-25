## Specific terms ot state params:
  - nominalPrice
  - issuePrice
  - quantity
    we will interpret quantity as token supply, similar to CERTF
  - splitRecordPeriod
  - dividendRecordPeriod
    For simplicity: Dividend Ex Date = Dividend Declaration Date + dividendRecordPeriod
  - dividendPaymentPeriod
    For simplicity, Dividend Payment Date = Dividend Declaration Date + dividendPaymentPeriod
  - Split params, defined on the (optional) Split Declaration Date:
    - splitRatio
    - splitRecordPeriod
      For simplicity, Split Ex Date = Split Declaration Date + splitRecordPeriod
    - splitSettlementPeriod
      For simplicity, Split Settlement Date = Split Declaration Date + splitSettlementPeriod
  - redeemableByIssuer
    if redeemableByIssuer=Y then the issuer can at any time insert the Redemption Declaration Date event
  - Redemption params, defined on (optional) the Redemption Declaration Date event:
    - redemptionPrice
    - numberOfShares (to be redeemed)


##  STK events:
  - AD: Monitoring
  - ID: Issue Date
     > Issuer issues STK by selling quantity shares worth nominalPrice at issuePrice (we will interpret quantity as token supply, similar to CERTF)
     At issuance, issuer fixes with terms: a dividend schedule (optional), right to redeem shares, etc...
     Dividend/redemption/splitRecordPeriod terms are optional and if not defined no DDD/RDD/SDD events will be generated
     If not otherwise set, STK is a perpetual instrument so no natural schedule end date (TD)
  - TD: Termination Date
     > If a contract is sold before MD (for example a bond on the secondary market) this date has to be set.
     It refers to the date at which the payment (of PTD) and transfer of the security happens.
     In other words, TD - if set - takes the role otherwise MD has from a cash flow perspective.
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

### Notes:
    - lets not yet "connect" the asset/engine/actor logic with action on the connected token representing the shares for now.
        we thus trust the operator of a shares contract to separately call e.g. a mint/burn function in combination with a splitSettlementDate event

### Payments
Payments occur on: IED, DPD, RPD
