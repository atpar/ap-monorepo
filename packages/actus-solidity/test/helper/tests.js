const { 
  parseTermsFromObject, 
  parseResultsFromObject,
  roundToDecimals,
  numberOfDecimals
} = require('./parser');

const TEST_TERMS_DIR = './actus-resources/tests/';
 

async function getTestCases (contract) {
  const testCases = require('../.' + TEST_TERMS_DIR + "actus-tests-" + contract + ".json");
  const testCaseNames = Object.keys(testCases);

  const parsedCases = {};
  testCaseNames.forEach( (name) => {
    const caseDetails = {};
    caseDetails['terms'] = parseTermsFromObject(testCases[name].terms);
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

    const decimalsEventValue = (numberOfDecimals(actualEvent.eventValue) < numberOfDecimals(expectedEvent.eventValue)) 
      ? numberOfDecimals(actualEvent.eventValue)
      : numberOfDecimals(expectedEvent.eventValue);

    const decimalsNominalValue = (numberOfDecimals(actualEvent.notionalPrincipal) < numberOfDecimals(expectedEvent.notionalPrincipal)) 
      ? numberOfDecimals(actualEvent.notionalPrincipal)
      : numberOfDecimals(expectedEvent.notionalPrincipal);

    const decimalsNominalAccrued = (numberOfDecimals(actualEvent.accruedInterest) < numberOfDecimals(expectedEvent.accruedInterest)) 
      ? numberOfDecimals(actualEvent.accruedInterest)
      : numberOfDecimals(expectedEvent.accruedInterest);

    assert.deepEqual({
      eventDate: actualEvent.eventDate,
      eventType: actualEvent.eventType,
      eventValue: roundToDecimals(actualEvent.eventValue, decimalsEventValue),
      notionalPrincipal: roundToDecimals(actualEvent.notionalPrincipal, decimalsNominalValue),
      nominalInterestRate: actualEvent.nominalInterestRate,
      accruedInterest: roundToDecimals(actualEvent.accruedInterest, decimalsNominalAccrued)
    }, {  
      eventDate: expectedEvent.eventDate,
      eventType: expectedEvent.eventType,
      eventValue: roundToDecimals(expectedEvent.eventValue, decimalsEventValue),
      notionalPrincipal: roundToDecimals(expectedEvent.notionalPrincipal, decimalsNominalValue),
      nominalInterestRate: expectedEvent.nominalInterestRate,
      accruedInterest: roundToDecimals(expectedEvent.accruedInterest, decimalsNominalAccrued)
    });
  }
}

function assertEqualStates(newState, expectedState){
  assert.equal(newState[0], expectedState.contractPerformance, "Difference in 'contractPerformance'");
  assert.equal(newState[1], expectedState.statusDate, "Difference in 'statusDate'");
  assert.equal(newState[2], expectedState.nonPerformingDate, "Difference in 'nonPerformingDate'");
  assert.equal(newState[3], expectedState.maturityDate, "Difference in 'maturityDate'");
  assert.equal(newState[4], expectedState.executionDate, "Difference in 'executionDate'");
  assert.equal(newState[5], expectedState.notionalPrincipal, "Difference in 'notionalPrincipal'");
  assert.equal(newState[6], expectedState.accruedInterest, "Difference in 'accruedInterest'");
  assert.equal(newState[7], expectedState.feeAccrued, "Difference in 'feeAccrued'");
  assert.equal(newState[8], expectedState.nominalInterestRate, "Difference in 'nominalInterestRate'");
  assert.equal(newState[9], expectedState.interestScalingMultiplier, "Difference in 'interestScalingMultiplier'");
  assert.equal(newState[10], expectedState.notionalScalingMultiplier, "Difference in 'notionalScalingMultiplier'");
  assert.equal(newState[11], expectedState.nextPrincipalRedemptionPayment, "Difference in 'nextPrincipalRedemptionPayment'");
  assert.equal(newState[12], expectedState.executionAmount, "Difference in 'executionAmount'");
}

function getDefaultState () {
  return {
    contractPerformance: 0, // 0 : Performant
    statusDate: 0,
    nonPerformingDate: 0,
    maturityDate: 31536000, // (1 year from 0)
    executionDate: 31536000, 
    notionalPrincipal: web3.utils.toWei("1000000"),
    accruedInterest: web3.utils.toWei("100"),
    feeAccrued: web3.utils.toWei("10"),
    nominalInterestRate: web3.utils.toWei("0.05"),
    interestScalingMultiplier: web3.utils.toWei("1.1"),
    notionalScalingMultiplier: web3.utils.toWei("0.9"),
    nextPrincipalRedemptionPayment: web3.utils.toWei("2500"),
    executionAmount: web3.utils.toWei("5000")
  }
}

module.exports = { assertEqualStates, getTestCases, getDefaultTestTerms, getDefaultState, compareTestResults }
