const { 
  parseTermsFromObject, 
  parseResultsFromObject,
  roundToDecimals,
  numberOfDecimals
} = require('./parser');

const TEST_TERMS_DIR = './actus-resources/tests/';
 

async function getTestCases (contract) {
  const fileSuffix = (contract === 'CEC' || contract === 'CEG') ? 'ANN' : contract;
  const testCases = require('../.' + TEST_TERMS_DIR + 'actus-tests-' + fileSuffix + '.json');
  const testCaseNames = Object.keys(testCases);

  const parsedCases = {};
  testCaseNames.forEach((name) => {
    const caseDetails = {};
    caseDetails['terms'] = parseTermsFromObject(contract, testCases[name].terms);
    caseDetails['results'] = parseResultsFromObject(testCases[name].results);
    caseDetails['externalData'] = testCases[name].externalData;
    parsedCases[name] = caseDetails;
  });

  return parsedCases;
}

async function getDefaultTestTerms (contract) {
  const testCases = await getTestCases(contract);
  return testCases[Object.keys(testCases)[0]].terms;
}

function compareTestResults (actualResults, expectedResults) {
  const numberOfEvents = (actualResults.length > expectedResults.length) ? actualResults.length : expectedResults.length;

  for (let i = 0; i < numberOfEvents; i++) {
    const actualEvent = actualResults[i];
    const expectedEvent = expectedResults[i];
    
    if (expectedEvent.eventValue) {
      const decimals = (numberOfDecimals(actualEvent.eventValue) < numberOfDecimals(expectedEvent.eventValue)) 
        ? numberOfDecimals(actualEvent.eventValue)
        : numberOfDecimals(expectedEvent.eventValue);
      actualEvent.eventValue = roundToDecimals(actualEvent.eventValue, decimals);
      expectedEvent.eventValue = roundToDecimals(expectedEvent.eventValue, decimals);
    }
    if (expectedEvent.notionalPrincipal) {
      const decimals = (numberOfDecimals(actualEvent.notionalPrincipal) < numberOfDecimals(expectedEvent.notionalPrincipal)) 
        ? numberOfDecimals(actualEvent.notionalPrincipal)
        : numberOfDecimals(expectedEvent.notionalPrincipal);
      actualEvent.notionalPrincipal = roundToDecimals(actualEvent.notionalPrincipal, decimals);
      expectedEvent.notionalPrincipal = roundToDecimals(expectedEvent.notionalPrincipal, decimals);
    }
    if (expectedEvent.nominalInterestRate) {
      const decimals = (numberOfDecimals(actualEvent.nominalInterestRate) < numberOfDecimals(expectedEvent.nominalInterestRate)) 
        ? numberOfDecimals(actualEvent.nominalInterestRate)
        : numberOfDecimals(expectedEvent.nominalInterestRate);
      actualEvent.nominalInterestRate = roundToDecimals(actualEvent.nominalInterestRate, decimals);
      expectedEvent.nominalInterestRate = roundToDecimals(expectedEvent.nominalInterestRate, decimals);
    }
    if (expectedEvent.accruedInterest) {
      const decimals = (numberOfDecimals(actualEvent.accruedInterest) < numberOfDecimals(expectedEvent.accruedInterest)) 
        ? numberOfDecimals(actualEvent.accruedInterest)
        : numberOfDecimals(expectedEvent.accruedInterest);
      actualEvent.accruedInterest = roundToDecimals(actualEvent.accruedInterest, decimals);
      expectedEvent.accruedInterest = roundToDecimals(expectedEvent.accruedInterest, decimals);
    }
    if (expectedEvent.quantity) {
      const decimals = (numberOfDecimals(actualEvent.quantity) < numberOfDecimals(expectedEvent.quantity)) 
        ? numberOfDecimals(actualEvent.quantity)
        : numberOfDecimals(expectedEvent.quantity);
      actualEvent.accruedInterest = roundToDecimals(actualEvent.quantity, decimals);
      expectedEvent.accruedInterest = roundToDecimals(expectedEvent.quantity, decimals);
    }
    if (expectedEvent.exerciseAmount) {
      const decimals = (numberOfDecimals(actualEvent.exerciseAmount) < numberOfDecimals(expectedEvent.exerciseAmount)) 
        ? numberOfDecimals(actualEvent.exerciseAmount)
        : numberOfDecimals(expectedEvent.exerciseAmount);
      actualEvent.exerciseAmount = roundToDecimals(actualEvent.exerciseAmount, decimals);
      expectedEvent.exerciseAmount = roundToDecimals(expectedEvent.exerciseAmount, decimals);
    }
    if (expectedEvent.exerciseQuantity) {
      const decimals = (numberOfDecimals(actualEvent.exerciseQuantity) < numberOfDecimals(expectedEvent.exerciseQuantity)) 
        ? numberOfDecimals(actualEvent.exerciseQuantity)
        : numberOfDecimals(expectedEvent.exerciseQuantity);
      actualEvent.exerciseQuantity = roundToDecimals(actualEvent.exerciseQuantity, decimals);
      expectedEvent.exerciseQuantity = roundToDecimals(expectedEvent.exerciseQuantity, decimals);
    }
    if (expectedEvent.exerciseQuantityOrdered) {
      // const decimals = (numberOfDecimals(actualEvent.exerciseQuantityOrdered) < numberOfDecimals(expectedEvent.exerciseQuantityOrdered)) 
      //   ? numberOfDecimals(actualEvent.exerciseQuantityOrdered)
      //   : numberOfDecimals(expectedEvent.exerciseQuantityOrdered);
      // actualEvent.exerciseQuantityOrdered = roundToDecimals(actualEvent.exerciseQuantityOrdered, decimals);
      // expectedEvent.exerciseQuantityOrdered = roundToDecimals(expectedEvent.exerciseQuantityOrdered, decimals);
      actualEvent.exerciseQuantityOrdered = 0;
      expectedEvent.exerciseQuantityOrdered = 0;
    }
    if (expectedEvent.marginFactor) {
      const decimals = (numberOfDecimals(actualEvent.marginFactor) < numberOfDecimals(expectedEvent.marginFactor)) 
        ? numberOfDecimals(actualEvent.marginFactor)
        : numberOfDecimals(expectedEvent.marginFactor);
      actualEvent.marginFactor = roundToDecimals(actualEvent.marginFactor, decimals);
      expectedEvent.marginFactor = roundToDecimals(expectedEvent.marginFactor, decimals);
    }
    if (expectedEvent.adjustmentFactor) {
      const decimals = (numberOfDecimals(actualEvent.adjustmentFactor) < numberOfDecimals(expectedEvent.adjustmentFactor)) 
        ? numberOfDecimals(actualEvent.adjustmentFactor)
        : numberOfDecimals(expectedEvent.adjustmentFactor);
      actualEvent.adjustmentFactor = roundToDecimals(actualEvent.adjustmentFactor, decimals);
      expectedEvent.adjustmentFactor = roundToDecimals(expectedEvent.adjustmentFactor, decimals);
    }
    if (expectedEvent.couponAmountFixed) {
      const decimals = (numberOfDecimals(actualEvent.couponAmountFixed) < numberOfDecimals(expectedEvent.couponAmountFixed)) 
        ? numberOfDecimals(actualEvent.couponAmountFixed)
        : numberOfDecimals(expectedEvent.couponAmountFixed);
      actualEvent.couponAmountFixed = roundToDecimals(actualEvent.couponAmountFixed, decimals);
      expectedEvent.couponAmountFixed = roundToDecimals(expectedEvent.couponAmountFixed, decimals);
    }

    assert.deepEqual(actualEvent, expectedEvent);
  }
}

function assertEqualStates(newState, expectedState){
  assert.equal(newState[0], expectedState.contractPerformance, "Difference in 'contractPerformance'");
  assert.equal(newState[1], expectedState.statusDate, "Difference in 'statusDate'");
  assert.equal(newState[2], expectedState.nonPerformingDate, "Difference in 'nonPerformingDate'");
  assert.equal(newState[3], expectedState.maturityDate, "Difference in 'maturityDate'");
  assert.equal(newState[4], expectedState.exerciseDate, "Difference in 'exerciseDate'");
  assert.equal(newState[5], expectedState.terminationDate, "Difference in 'terminationDate'");
  assert.equal(newState[5], expectedState.lastCouponDay, "Difference in 'lastCouponyDay'");
  assert.equal(newState[6], expectedState.notionalPrincipal, "Difference in 'notionalPrincipal'");
  assert.equal(newState[7], expectedState.accruedInterest, "Difference in 'accruedInterest'");
  assert.equal(newState[8], expectedState.feeAccrued, "Difference in 'feeAccrued'");
  assert.equal(newState[9], expectedState.nominalInterestRate, "Difference in 'nominalInterestRate'");
  assert.equal(newState[10], expectedState.interestScalingMultiplier, "Difference in 'interestScalingMultiplier'");
  assert.equal(newState[11], expectedState.notionalScalingMultiplier, "Difference in 'notionalScalingMultiplier'");
  assert.equal(newState[12], expectedState.nextPrincipalRedemptionPayment, "Difference in 'nextPrincipalRedemptionPayment'");
  assert.equal(newState[13], expectedState.exerciseAmount, "Difference in 'exerciseAmount'");
  assert.equal(newState[14], expectedState.exerciseQuantity, "Difference in 'exerciseQuantity'");
  assert.equal(newState[15], expectedState.quantity, "Difference in 'quantity'");
  assert.equal(newState[16], expectedState.couponAmountFixed, "Difference in 'couponAmountFixed'");
  assert.equal(newState[17], expectedState.marginFactor, "Difference in 'marginFactor'");
  assert.equal(newState[18], expectedState.adjustmentFactor, "Difference in 'adjustmentFactor'");
}

function getDefaultState () {
  return {
    contractPerformance: 0, // PF
    statusDate: 0,
    nonPerformingDate: 0,
    maturityDate: 31536000, // (1 year from 0)
    exerciseDate: 31536000, 
    terminationDate: 31536000, 
    lastCouponDay: 0, 
    notionalPrincipal: web3.utils.toWei("1000000"),
    accruedInterest: web3.utils.toWei("100"),
    feeAccrued: web3.utils.toWei("10"),
    nominalInterestRate: web3.utils.toWei("0.05"),
    interestScalingMultiplier: web3.utils.toWei("1.1"),
    notionalScalingMultiplier: web3.utils.toWei("0.9"),
    nextPrincipalRedemptionPayment: web3.utils.toWei("2500"),
    exerciseAmount: web3.utils.toWei("5000")
  }
}

module.exports = { assertEqualStates, getTestCases, getDefaultTestTerms, getDefaultState, compareTestResults }
