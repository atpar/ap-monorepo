/* global artifacts, web3 */

/**
 * @param {import('../../deploy/1-extend-buidler-env-for-tests').ExtendedTestBRE} bre
 * @param {Object} [carrier] - object to inject web3 Contract instances into
 * @return {Promise<{Instances}>} `carrier` with injected instances
 */
async function setupTestEnvironment(bre, carrier = {}) {
  // run deployment scripts and create the EVM snapshot, or, if already created, restore the snapshot
  await bre.deployments.fixture("u-tests");

  // instantiate web3 Contract instances
  await bre.deployments.run("instances-tests");

  // inject instances into `carrier`
  Object.keys(bre.usrNs.instances)
      .forEach((name) => carrier[name] = bre.usrNs.instances[name]);

  return carrier;
}

function parseToContractTerms(contract, terms) {
  return require('@atpar/actus-solidity/test/helper/parser').parseTermsFromObject(contract, terms);
}

async function getDefaultTerms (contract) {
  return require('@atpar/actus-solidity/test/helper/tests').getDefaultTestTerms(contract);
}

function getZeroTerms () {
  return require('./terms/zero-terms.json');
}

function getComplexTerms () {
  return require('./terms/complex-terms.json');
}

async function deployPaymentToken(owner, holders, SettlementTokenInstance) {
  const PaymentTokenInstance = await SettlementTokenInstance.deploy().send({ from: owner });

  for (let holder of holders) {
    await PaymentTokenInstance.methods.transfer(holder, web3.utils.toWei('5000')).send({ from: owner });
  }

  return PaymentTokenInstance;
}

module.exports = {
  setupTestEnvironment,
  parseToContractTerms,
  getDefaultTerms,
  getZeroTerms,
  getComplexTerms,
  deployPaymentToken
};
