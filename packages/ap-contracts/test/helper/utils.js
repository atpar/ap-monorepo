const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('actus-solidity/test/helper/parser');
const { parseTermsToProductTerms, parseTermsToCustomTerms, convertDatesToOffsets } = require('./setupTestEnvironment');

const ERC20SampleToken = artifacts.require('ERC20SampleToken');

const { deriveProductId } = require('./orderUtils');


const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
const ZERO_BYTES = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

function getEngineContractInstanceForContractType(instances, contractType) {
  if (contractType === 0) {
    return instances.PAMEngineInstance;
  } else if (contractType === 1) {
    return instances.ANNEngineInstance;
  } else if (contractType === 16) {
    return instances.CEGEngineInstance;
  } else if (contractType === 17) {
    return instances.CECEngineInstance;
  } else {
    throw new Error('Contract Type not supported.');
  }
}

function deriveTerms(terms) {
  return {
    lifecycleTerms: parseTermsToLifecycleTerms(terms),
    generatingTerms: convertDatesToOffsets(parseTermsToGeneratingTerms(terms)),
    productTerms: parseTermsToProductTerms(terms),
    customTerms: parseTermsToCustomTerms(terms)
  }
}

async function generateProductSchedules(engineContractInstance, generatingTerms) {
  return {
    nonCyclicSchedule: await engineContractInstance.computeNonCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate),
    cyclicIPSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 8),
    cyclicPRSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 15),
    cyclicSCSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 19),
    cyclicRRSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 18),
    cyclicFPSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 4),
    cyclicPYSchedule: await engineContractInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 11),
  };
}

async function registerProduct(instances, terms) {
  const { generatingTerms, productTerms } = deriveTerms(terms);
  const productSchedules = await generateProductSchedules(
    getEngineContractInstanceForContractType(instances, terms.contractType),
    generatingTerms
  ); 
  const productId = deriveProductId(productTerms, productSchedules);

  await instances.ProductRegistryInstance.registerProduct(productTerms, productSchedules);

  return productId;
}

async function deployPaymentToken(owner, holders) {
  const PaymentTokenInstance = await ERC20SampleToken.new({ from: owner });

  for (holder of holders) {
    await PaymentTokenInstance.transfer(holder, web3.utils.toWei('5000'), { from: owner });
  }

  return PaymentTokenInstance;
}

module.exports = {
  getEngineContractInstanceForContractType,
  generateProductSchedules,
  registerProduct,
  deployPaymentToken,
  deriveTerms,
  ZERO_ADDRESS,
  ZERO_BYTES32,
  ZERO_BYTES
}