const web3Utils = require('web3-utils')
const fs = require('fs')
const parse = require('csv-parse')
const BigNumber = require('bignumber.js')

const ContractEventDefinitions = require('./APDefinitions/ContractEventDefinitions.json')
const ContractTermsDefinitions = require('./APDefinitions/ContractTermsDefinitions.json')

const parseDateToUnix = (date) => {
  let isoDate = new Date(date + 'Z') // .toISOString()
  return isoDate.getTime() / 1000
}

const parseCycleToIPS = (cycle) => {
  if (cycle === '') { return { i: 0, p: 0, s: 0, isSet: false } }

  const pOptions = ['D', 'W', 'M', 'Q', 'H', 'Y']

  let i = String(cycle).slice(0, -2)
  let p = pOptions.indexOf(String(cycle).slice(-2, -1))
  let s = (String(cycle).slice(-1) === '+') ? 0 : 1

  return { i: i, p: p, s: s, isSet: true }
}

module.exports = {
  parseTestResults: (pathToFile) => new Promise((resolve, reject) => {
    const testResults = []
    let lineCount = 0

    fs.createReadStream(pathToFile)
      .on('error', (error) => { reject(error) })  
      .pipe(parse({ delimiter: ',' }))
      .on('data', (row) => {
        lineCount++
        if (lineCount === 1) { return }
        let eventTypeIndex = ContractEventDefinitions.eventType.options.indexOf(row[1])
        if (eventTypeIndex === 2) { return }
        testResults.push([
          new Date(row[0] + 'Z').toISOString(),
          eventTypeIndex.toString(),
          Number(row[2]),
          Number(row[3]),
          Number(row[4]),
          Number(row[5])
        ])
      })
      .on('end', () => { resolve(testResults) })
  }),
  parseContractTerms: (pathToFile, precision) => new Promise((resolve, reject) => {
    let testTerms = {}
    let isHeader = true

    fs.createReadStream(pathToFile)
      .on('error', (error) => { reject(error) })
      .pipe(parse({ delimiter: ',' }))
      .on('data', (row) => {
        if (isHeader === true) { isHeader = false; return }

        let parsedContractTerms = {}

        parsedContractTerms['calendar'] = (row[19] === '') ? 0 : ContractTermsDefinitions.calendar.options.indexOf(row[19])
        parsedContractTerms['contractRole'] = (row[23] === '') ? 0 : ContractTermsDefinitions.contractRole.options.indexOf(row[23])
        parsedContractTerms['legalEntityIdRecordCreator'] = 'PartyA'
        parsedContractTerms['legalEntityIdCounterparty'] = 'PartyB'
        parsedContractTerms['dayCountConvention'] = (row[16] === '') ? 0 : ContractTermsDefinitions.dayCountConvention.options.indexOf(row[16])
        parsedContractTerms['businessDayConvention'] = (row[17] === '') ? 0 : ContractTermsDefinitions.businessDayConvention.options.indexOf(row[17])
        parsedContractTerms['endOfMonthConvention'] = 0 // row[18] === ''? 0 : ContractTermsDefinitions.endOfMonthConvention.options.indexOf(row[18])
        parsedContractTerms['currency'] = 2 // row[4] === ''? 0 : ContractTermsDefinitions.currency.options.indexOf(row[4])
        parsedContractTerms['scalingEffect'] = 0 // ...
        parsedContractTerms['penaltyType'] = 0 // ...
        parsedContractTerms['feeBasis'] = 0 // ...

        parsedContractTerms['statusDate'] = (row[2] === '') ? 0 : parseDateToUnix(row[2])
        parsedContractTerms['initialExchangeDate'] = (row[6] === '') ? 0 : parseDateToUnix(row[6])
        parsedContractTerms['maturityDate'] = (row[7] === '') ? 0 : parseDateToUnix(row[7])
        parsedContractTerms['terminationDate'] = 0 // ...
        parsedContractTerms['purchaseDate'] = 0 // ...
        parsedContractTerms['capitalizationEndDate'] = (row[22] === '') ? 0 : parseDateToUnix(row[22])
        parsedContractTerms['cycleAnchorDateOfInterestPayment'] = (row[9] === '') ? 0 : parseDateToUnix(row[9])
        parsedContractTerms['cycleAnchorDateOfRateReset'] = (row[12] === '') ? 0 : parseDateToUnix(row[12])
        parsedContractTerms['cycleAnchorDateOfScalingIndex'] = 0 // ...
        parsedContractTerms['cycleAnchorDateOfFee'] = 0 // ...
        parsedContractTerms['notionalPrincipal'] = (row[5] === '') ? 0 : web3Utils.toHex(new BigNumber(row[5]).shiftedBy(precision))
        parsedContractTerms['nominalInterestRate'] = (row[8] === '') ? 0 : web3Utils.toHex(new BigNumber(row[8]).shiftedBy(precision))
        parsedContractTerms['feeAccrued'] = 0 // ...
        parsedContractTerms['accruedInterest'] = (row[11] === '') ? 0 : web3Utils.toHex(new BigNumber(row[11]).shiftedBy(precision))
        parsedContractTerms['rateMultiplier'] = (row[21] === '') ? 0 : web3Utils.toHex(new BigNumber(row[21]).shiftedBy(precision))
        parsedContractTerms['rateSpread'] = (row[14] === '') ? 0 : web3Utils.toHex(new BigNumber(row[14]).shiftedBy(precision))
        parsedContractTerms['feeRate'] = 0 // ...
        parsedContractTerms['nextResetRate'] = 0 // ...
        parsedContractTerms['penaltyRate'] = 0 // ...
        parsedContractTerms['premiumDiscountAtIED'] = (row[20] === '') ? 0 : web3Utils.toHex(new BigNumber(row[20]).shiftedBy(precision))
        parsedContractTerms['priceAtPurchaseDate'] = 0 // ...

        parsedContractTerms['cycleOfInterestPayment'] = parseCycleToIPS(row[10])
        parsedContractTerms['cycleOfRateReset'] = parseCycleToIPS(row[13])
        parsedContractTerms['cycleOfScalingIndex'] = parseCycleToIPS('')
        parsedContractTerms['cycleOfFee'] = parseCycleToIPS('')

        parsedContractTerms['lifeCap'] = 0
        parsedContractTerms['lifePeriod'] = 0
        parsedContractTerms['lifeFloor'] = 0
        parsedContractTerms['periodCap'] = 0
        parsedContractTerms['periodFloor'] = 0

        testTerms[row[1]] = parsedContractTerms
      })
      .on('end', () => { resolve(testTerms) })
  }),
  parseContractTerms2: (csv, precision) => new Promise((resolve, reject) => {
    let testTerms = {}
    let isHeader = true

    parse(csv, { delimiter: ',' })
    .on('data', (row) => {
      if (isHeader === true) { isHeader = false; return }

      let parsedContractTerms = {}

      parsedContractTerms['calendar'] = (row[19] === '') ? 0 : ContractTermsDefinitions.calendar.options.indexOf(row[19])
      parsedContractTerms['contractRole'] = (row[23] === '') ? 0 : ContractTermsDefinitions.contractRole.options.indexOf(row[23])
      parsedContractTerms['legalEntityIdRecordCreator'] = 'PartyA'
      parsedContractTerms['legalEntityIdCounterparty'] = 'PartyB'
      parsedContractTerms['dayCountConvention'] = (row[16] === '') ? 0 : ContractTermsDefinitions.dayCountConvention.options.indexOf(row[16])
      parsedContractTerms['businessDayConvention'] = (row[17] === '') ? 0 : ContractTermsDefinitions.businessDayConvention.options.indexOf(row[17])
      parsedContractTerms['endOfMonthConvention'] = 0 // row[18] === ''? 0 : ContractTermsDefinitions.endOfMonthConvention.options.indexOf(row[18])
      parsedContractTerms['currency'] = 2 // row[4] === ''? 0 : ContractTermsDefinitions.currency.options.indexOf(row[4])
      parsedContractTerms['scalingEffect'] = 0 // ...
      parsedContractTerms['penaltyType'] = 0 // ...
      parsedContractTerms['feeBasis'] = 0 // ...

      parsedContractTerms['statusDate'] = (row[2] === '') ? 0 : parseDateToUnix(row[2])
      parsedContractTerms['initialExchangeDate'] = (row[6] === '') ? 0 : parseDateToUnix(row[6])
      parsedContractTerms['maturityDate'] = (row[7] === '') ? 0 : parseDateToUnix(row[7])
      parsedContractTerms['terminationDate'] = 0 // ...
      parsedContractTerms['purchaseDate'] = 0 // ...
      parsedContractTerms['capitalizationEndDate'] = (row[22] === '') ? 0 : parseDateToUnix(row[22])
      parsedContractTerms['cycleAnchorDateOfInterestPayment'] = (row[9] === '') ? 0 : parseDateToUnix(row[9])
      parsedContractTerms['cycleAnchorDateOfRateReset'] = (row[12] === '') ? 0 : parseDateToUnix(row[12])
      parsedContractTerms['cycleAnchorDateOfScalingIndex'] = 0 // ...
      parsedContractTerms['cycleAnchorDateOfFee'] = 0 // ...
      parsedContractTerms['notionalPrincipal'] = (row[5] === '') ? 0 : web3Utils.toHex(new BigNumber(row[5]).shiftedBy(precision))
      parsedContractTerms['nominalInterestRate'] = (row[8] === '') ? 0 : web3Utils.toHex(new BigNumber(row[8]).shiftedBy(precision))
      parsedContractTerms['feeAccrued'] = 0 // ...
      parsedContractTerms['accruedInterest'] = (row[11] === '') ? 0 : web3Utils.toHex(new BigNumber(row[11]).shiftedBy(precision))
      parsedContractTerms['rateMultiplier'] = (row[21] === '') ? 0 : web3Utils.toHex(new BigNumber(row[21]).shiftedBy(precision))
      parsedContractTerms['rateSpread'] = (row[14] === '') ? 0 : web3Utils.toHex(new BigNumber(row[14]).shiftedBy(precision))
      parsedContractTerms['feeRate'] = 0 // ...
      parsedContractTerms['nextResetRate'] = 0 // ...
      parsedContractTerms['penaltyRate'] = 0 // ...
      parsedContractTerms['premiumDiscountAtIED'] = (row[20] === '') ? 0 : web3Utils.toHex(new BigNumber(row[20]).shiftedBy(precision))
      parsedContractTerms['priceAtPurchaseDate'] = 0 // ...

      parsedContractTerms['cycleOfInterestPayment'] = parseCycleToIPS(row[10])
      parsedContractTerms['cycleOfRateReset'] = parseCycleToIPS(row[13])
      parsedContractTerms['cycleOfScalingIndex'] = parseCycleToIPS('')
      parsedContractTerms['cycleOfFee'] = parseCycleToIPS('')

      parsedContractTerms['lifeCap'] = 0
      parsedContractTerms['lifePeriod'] = 0
      parsedContractTerms['lifeFloor'] = 0
      parsedContractTerms['periodCap'] = 0
      parsedContractTerms['periodFloor'] = 0

      testTerms[row[1]] = parsedContractTerms
    })
    .on('end', () => { resolve(testTerms) })
  })
}
