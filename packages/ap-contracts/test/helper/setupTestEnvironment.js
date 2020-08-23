/** @typedef {import('../../deploy/1-extend-buidler-env-for-tests').ExtendedTestBRE} */

/**
 * Returns a function that -
 *   on its first invocation, runs the code bellow and then creates the EVM snapshot
 *   on further calls, restores the snapshot (skipping the code bellow)
 * @param {ExtendedTestBRE} bre
 * @param {any} [self] - object to injects deployed contracts into (think of `this` inside `before()` or `it()`)
 * @param {(bre: <ExtendedTestBRE>, self: any) => Promise: <any>} [customCode] - code to run before snapshotting
 * @return {(<ExtendedTestBRE>) => Promise<any>}
 */
function getSnapshotTaker(bre, self = undefined, customCode = undefined) {
  console.error('*** getSnapshotTaker called');
  return bre.deployments.createFixture(async (bre) => {
    console.error('*** lambda in getSnapshotTaker start');

    /*
     on the 1st `bre.deployments.fixture` invocation, once  only,
     buidler runs deployment scripts then creates the "global" snapshot for tags specified
     */
    await bre.deployments.fixture("u-tests");

    /*
     on the first call of a (function) instance that `getSnapshotTaker` returns,
     buidler runs the code that follows and then creates an "instance specific" snapshot
     (on further calls of this instance, buidler re-uses this snapshot, skipping the code)
     */

    if (self) {
      // inject into `self` the web3.eth.Contract instances of deployed contracts
      Object.keys(bre.usrNs.instances)
          .forEach((name) => self[name] = bre.usrNs.instances[name]);
      // ... and a "fresh" copy of accounts
      self.accounts = ([]).concat(...bre.usrNs.accounts);
      // ... amd default tx options (think of web3 `send`)
      self.txOpts = { from: self.accounts[9] }
    }

    if (typeof customCode === 'function') {
      // run custom transactions (or any code)
      console.error('*** lambda in getSnapshotTaker calling customCode');
      return await customCode(bre, self);
    }
    console.error('*** lambda in getSnapshotTaker end');
  });
}

/**
 * @param {ExtendedTestBRE} bre
 * @param {string} owner - token owner address
 * @param {string[]} [holders] - token holders
 */
async function deployPaymentToken(bre, owner, holders= []) {
  console.error('*** deployPaymentToken start');
  const { deployments: { deploy }, web3 } = bre;
  const { abi, address } = await deploy("SettlementToken", {
    from: owner,
    // deploy a new instance rather than re-use the one already deployed with another "from" address
    fieldsToCompare: [ "data", "from" ],
  });
  const instance = new web3.eth.Contract(abi, address);

  for (let holder of holders) {
    console.error('*** deployPaymentToken transfer');
    await instance.methods.transfer(holder, web3.utils.toWei('5000')).send({ from: owner });
  }

  console.error('*** deployPaymentToken end');
  return instance;
}
// async function deployPaymentToken(bre, owner, holders) {
//   console.error('*** deployPaymentToken start');
//   bre.usrNs.roles.SettlementToken = { owner };
//   if (holders) bre.usrNs.roles.SettlementToken.holders = holders;
//   const { SettlementToken: { abi, address }} = await bre.deployments.run("extra-settlement-token");
//   console.error('*** deployPaymentToken end');
//   return new bre.web3.eth.Contract(abi, address);
// }

/**
 * @param {ExtendedTestBRE} bre
 */
async function deployVanillaFDT(bre, {
  name = 'FundsDistributionToken',
  symbol = 'FDT',
  fundsToken,
  owner,
  initialAmount = 0,
})
{
  const { deployments: { deploy, log }, web3 } = bre;
  const { abi, address } = await deploy("VanillaFDT", {
    args: [name, symbol, fundsToken, owner, initialAmount],
    from: owner,
    // deploy a new instance rather than re-use the one already deployed with another "from" address
    fieldsToCompare: [ "data", "from" ],
  });
  return new bre.web3.eth.Contract(abi, address);
}

/**
 * @param {ExtendedTestBRE} bre
 */
async function deploySimpleRestrictedFDT(bre, {
  name = 'FundsDistributionToken',
  symbol = 'FDT',
  fundsToken,
  owner,
  initialAmount = 0,
})
{
  const { deployments: { deploy, log }, web3 } = bre;
  const { abi, address } = await deploy("SimpleRestrictedFDT", {
    args: [name, symbol, fundsToken, owner, initialAmount],
    from: owner,
    // deploy a new instance rather than re-use the one already deployed with another "from" address
    fieldsToCompare: [ "data", "from" ],
  });
  return new bre.web3.eth.Contract(abi, address);
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

module.exports = {
  getSnapshotTaker,
  setupTestEnvironment: () => { throw new Error('Deprecated. Use `createCustomSnapshot` instead') },
  parseToContractTerms,
  getDefaultTerms,
  getZeroTerms,
  getComplexTerms,
  deployPaymentToken,
  deploySimpleRestrictedFDT,
  deployVanillaFDT
};
