const web3Utils = require('web3-utils')
const fs = require('fs')
const parse = require('csv-parse')
const BigNumber = require('bignumber.js')

const ContractEventDefinitions = require('./APDefinitions/ContractEventDefinitions.json')
const ContractTermsDefinitions = require('./APDefinitions/ContractTermsDefinitions.json')

const PRECISION = 18

const isoToUnix = (date) => {
  return (new Date(date + 'Z')).getTime() / 1000
}

const unixToISO = (unix) => {
  return new Date(unix * 1000).toISOString()
}

const getIndexOfAttribute = (attribute, value) => {
  return ContractTermsDefinitions[attribute].options.indexOf(value)
}

const toPrecision = (value) => {
  return web3Utils.toHex(new BigNumber(value).shiftedBy(PRECISION))
}

const fromPrecision = (value) => {
  return Math.round((value * 10 ** -PRECISION) * 10000000000000) / 10000000000000
}

const parseCycleToIPS = (cycle) => {
  if (cycle === '') { return { i: 0, p: 0, s: 0, isSet: false } }

  const pOptions = ['D', 'W', 'M', 'Q', 'H', 'Y']

  let i = String(cycle).slice(0, -2)
  let p = pOptions.indexOf(String(cycle).slice(-2, -1))
  let s = (String(cycle).slice(-1) === '+') ? 0 : 1

  return { i: i, p: p, s: s, isSet: true }
}

const parseRow = (row) => {
  const parsedRow = {}

  parsedRow['calendar'] = (row[19] === '') ? 0 : getIndexOfAttribute('calendar', row[19])
  parsedRow['contractRole'] = (row[23] === '') ? 0 : getIndexOfAttribute('contractRole', row[23])
  parsedRow['legalEntityIdRecordCreator'] = 'PartyA'
  parsedRow['legalEntityIdCounterparty'] = 'PartyB'
  parsedRow['dayCountConvention'] = (row[16] === '') ? 0 : getIndexOfAttribute('dayCountConvention', row[16])
  parsedRow['businessDayConvention'] = (row[17] === '') ? 0 : getIndexOfAttribute('businessDayConvention', row[17])
  parsedRow['endOfMonthConvention'] = 0 // row[18] === ''? 0 : ContractTermsDefinitions.endOfMonthConvention.options.indexOf(row[18])
  parsedRow['currency'] = 2 // row[4] === ''? 0 : ContractTermsDefinitions.currency.options.indexOf(row[4])
  parsedRow['scalingEffect'] = 0 // ...
  parsedRow['penaltyType'] = 0 // ...
  parsedRow['feeBasis'] = 0 // ...

  parsedRow['statusDate'] = (row[2] === '') ? 0 : isoToUnix(row[2])
  parsedRow['initialExchangeDate'] = (row[6] === '') ? 0 : isoToUnix(row[6])
  parsedRow['maturityDate'] = (row[7] === '') ? 0 : isoToUnix(row[7])
  parsedRow['terminationDate'] = 0 // ...
  parsedRow['purchaseDate'] = 0 // ...
  parsedRow['capitalizationEndDate'] = (row[22] === '') ? 0 : isoToUnix(row[22])
  parsedRow['cycleAnchorDateOfInterestPayment'] = (row[9] === '') ? 0 : isoToUnix(row[9])
  parsedRow['cycleAnchorDateOfRateReset'] = (row[12] === '') ? 0 : isoToUnix(row[12])
  parsedRow['cycleAnchorDateOfScalingIndex'] = 0 // ...
  parsedRow['cycleAnchorDateOfFee'] = 0 // ...
  parsedRow['notionalPrincipal'] = (row[5] === '') ? 0 : toPrecision(row[5])
  parsedRow['nominalInterestRate'] = (row[8] === '') ? 0 : toPrecision(row[8])
  parsedRow['feeAccrued'] = 0 // ...
  parsedRow['accruedInterest'] = (row[11] === '') ? 0 : toPrecision(row[11])
  parsedRow['rateMultiplier'] = (row[21] === '') ? 0 : toPrecision(row[21])
  parsedRow['rateSpread'] = (row[14] === '') ? 0 : toPrecision(row[14])
  parsedRow['feeRate'] = 0 // ...
  parsedRow['nextResetRate'] = 0 // ...
  parsedRow['penaltyRate'] = 0 // ...
  parsedRow['premiumDiscountAtIED'] = (row[20] === '') ? 0 : toPrecision(row[20])
  parsedRow['priceAtPurchaseDate'] = 0 // ...

  parsedRow['cycleOfInterestPayment'] = parseCycleToIPS(row[10])
  parsedRow['cycleOfRateReset'] = parseCycleToIPS(row[13])
  parsedRow['cycleOfScalingIndex'] = parseCycleToIPS('')
  parsedRow['cycleOfFee'] = parseCycleToIPS('')

  parsedRow['lifeCap'] = 0 // ...
  parsedRow['lifePeriod'] = 0 // ...
  parsedRow['lifeFloor'] = 0 // ...
  parsedRow['periodCap'] = 0 // ...
  parsedRow['periodFloor'] = 0 // ...

  return parsedRow;
}


const parseResultsFromPath = (pathToFile) => new Promise((resolve, reject) => {
  const testResults = []
  let lineCount = 0

  fs.createReadStream(pathToFile)
  .on('error', (error) => reject(error) )  
  .pipe(parse({ delimiter: ',' }))
  .on('data', (row) => {
    lineCount++
    if (lineCount === 1) { return }
    const eventTypeIndex = ContractEventDefinitions.eventType.options.indexOf(row[1])
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
  .on('end', () => resolve(testResults))
})

const parseTermsFromPath = (pathToFile) => new Promise((resolve, reject) => {
  const testTerms = {}
  let isHeader = true

  fs.createReadStream(pathToFile)
  .on('error', (error) => reject(error))
  .pipe(parse({ delimiter: ',' }))
  .on('data', (row) => {  
    if (isHeader === true) { isHeader = false; return }
    testTerms[row[1]] = parseRow(row)
  })
  .on('end', () => resolve(testTerms))
})

const parseTermsFromCSVString = (csv) => new Promise((resolve, reject) => {
  const testTerms = {}
  let isHeader = true

  parse(csv, { delimiter: ',' })
  .on('error', (error) => reject(error))
  .on('data', (row) => {
    if (isHeader === true) { isHeader = false; return }
    testTerms[row[1]] = parseRow(row)
  })
  .on('end', () => resolve(testTerms))
})

module.exports = { parseTermsFromPath, parseTermsFromCSVString, parseResultsFromPath, fromPrecision, unixToISO }
