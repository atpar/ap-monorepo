const web3Utils = require('web3-utils')
const BigNumber = require('bignumber.js')
const csv = require('csvtojson')

const ContractEventDefinitions = require('./definitions/ContractEventDefinitions.json')
const ContractTermsDefinitions = require('./definitions/ContractTermsDefinitions.json')
const CoveredTerms = require('./definitions/covered-terms.json')

const PRECISION = 18


const isoToUnix = (date) => {
  return (new Date(date + 'Z')).getTime() / 1000
}

const unixToISO = (unix) => {
  return new Date(unix * 1000).toISOString()
}

const toHex = (value) => {  
  return web3Utils.asciiToHex(value); // return web3Utils.toHex(value)
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

const capitalize = (str) => {
  return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

const parseCycleToIPS = (cycle) => {
  if (cycle === '' || !cycle) { return { i: 0, p: 0, s: 0, isSet: false } }

  const pOptions = ['D', 'W', 'M', 'Q', 'H', 'Y']

  let i = String(cycle).slice(0, -2)
  let p = pOptions.indexOf(String(cycle).slice(-2, -1))
  let s = (String(cycle).slice(-1) === '+') ? 0 : 1

  return { i: i, p: p, s: s, isSet: true }
}

const parseTermsRow = (terms) => {
  const parsedTerms = {}

  for (const attribute of CoveredTerms) {
    const value = terms[capitalize(attribute)]

    if (ContractTermsDefinitions[attribute].type === 'enum') {
      parsedTerms[attribute] = (value) ? getIndexOfAttribute(attribute, value) : 0
    } else if (ContractTermsDefinitions[attribute].type === 'text') {
      parsedTerms[attribute] = toHex((value) ? value : '')
    } else if (ContractTermsDefinitions[attribute].type === 'number') {
      parsedTerms[attribute] = (value) ? toPrecision(value) : 0
    } else if (ContractTermsDefinitions[attribute].type === 'date') {
      parsedTerms[attribute] = (value) ? isoToUnix(value) : 0
    } else if (ContractTermsDefinitions[attribute].type === 'cycle') {
      parsedTerms[attribute] = parseCycleToIPS(value)
    }
  }

  parsedTerms['currency'] = '0x0000000000000000000000000000000000000000'

  return parsedTerms;
}

const parseResultsFromPath = async (pathToFile) => {  
  const csvAsJSON = await csv().fromFile(pathToFile)
  const testResults = []

  for (const object of csvAsJSON) {
    const eventTypeIndex = ContractEventDefinitions.eventType.options.indexOf(object['Event Type'])
    if (eventTypeIndex === 2) { continue } // filter out AD events
    testResults.push([
      new Date(object['Event Date'] + 'Z').toISOString(),
      eventTypeIndex.toString(),
      Number(object['Event Value']),
      Number(object['Nominal Value']),
      Number(object['Nominal Rate']),
      Number(object['Nominal Accrued'])
    ])
  }

  return testResults
}

const parseTermsFromPath = async (pathToFile) => {
  const csvAsJSON = await csv().fromFile(pathToFile)
  const testTerms = {}

  for (const object of csvAsJSON) {
    testTerms[object['ContractID']] = parseTermsRow(object)
  }

  return testTerms
}

const parseTermsFromCSVString = async (csvString) => {
  const csvAsJSON = await csv().fromString(csvString)
  const testTerms = {}

  for (const object of csvAsJSON) {
    testTerms[object['ContractID']] = parseTermsRow(object)
  }

  return testTerms
}

module.exports = { parseTermsFromPath, parseTermsFromCSVString, parseResultsFromPath, fromPrecision, unixToISO }
