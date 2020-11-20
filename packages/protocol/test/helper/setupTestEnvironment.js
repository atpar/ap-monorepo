/** @typedef {import('../../deploy/1-extend-buidler-env-for-tests').ExtendedTestBRE} */

/**
 * Returns a function that -
 *   on its first invocation, runs the code bellow and then creates the EVM snapshot
 *   on further calls, restores the snapshot (skipping the code bellow)
 * @param {ExtendedTestBRE} buidlerRuntime
 * @param {any} [self] - object to injects deployed contracts into (think of `this` inside `before()` or `it()`)
 * @param {(buidlerRuntime: <ExtendedTestBRE>, self: any) => Promise: <any>} [customCode] - runs before snapshotting
 * @return {(<ExtendedTestBRE>) => Promise<any>}
 */
function getSnapshotTaker(buidlerRuntime, self = undefined, customCode = undefined) {
  return buidlerRuntime.deployments.createFixture(async (buidlerRuntime) => {
    /*
     on the 1st `buidlerRuntime.deployments.fixture` invocation, once  only,
     buidler runs deployment scripts then creates the 'global' snapshot for tags specified
     */
    await buidlerRuntime.deployments.fixture('u-tests');

    /*
     on the first call of a (function) instance that `getSnapshotTaker` returns,
     buidler runs the code that follows and then creates an 'instance specific' snapshot
     (on further calls of this instance, buidler re-uses this snapshot, skipping the code)
     */

    if (self) {
      // inject into `self` the web3.eth.Contract instances of deployed contracts
      Object.keys(buidlerRuntime.usrNs.instances)
        .forEach((name) => self[name] = buidlerRuntime.usrNs.instances[name]);
      // ... and a 'fresh' copy of accounts
      self.accounts = ([]).concat(...buidlerRuntime.usrNs.accounts);
      // ... amd default tx options (think of web3 `send`)
      self.txOpts = { from: self.accounts[9] }
    }

    if (typeof customCode === 'function') {
      // run custom transactions (or any code)
      return await customCode(buidlerRuntime, self);
    }
  });
}

/**
 * Deploy a new contract instance using artifacts' abi and bytecode
 * Note: it doesn't link libraries (use 'reuseOrDeployContract' if linking needed)
 * @param {ExtendedTestBRE} buidlerRuntime
 * @param {string} contractName
 * @param {any} arguments Constructor arguments
 * @param {any} opts Any options to pass to web3.eth.Contract' `deploy` function
 * @return {any} web3.eth.Contract instance
 */
async function deployContract(buidlerRuntime, contractName, arguments = [], opts = {}) {
  const { deployments: { getArtifact }, usrNs: { roles: { deployer }}, web3 } = buidlerRuntime;
  const { abi, bytecode: data } = await getArtifact(contractName);
  const options = Object.assign({ from: deployer }, opts);
  const instance = new web3.eth.Contract(abi);
  return (await instance.deploy({ data, arguments }).send(options));
}

/**
 * Re-use a deployed contract instance, otherwise deploy a new instance using buidler' `deploy` function
 * @param {ExtendedTestBRE} buidlerRuntime
 * @param {string} contractName
 * @param {any} arguments Constructor arguments
 * @param {any} opts Any options to pass to buidlerRuntime' `deploy` function
 * @return {any} web3.eth.Contract instance
 */
async function reuseOrDeployContract(buidlerRuntime, contractName, arguments = [], opts = {}) {
  const { deployments: { deploy }, usrNs: { roles: { deployer }}, web3 } = buidlerRuntime;
  const defaultOptions = { from: deployer, fieldsToCompare: [ 'data', 'from' ], arguments };
  const options = Object.assign(defaultOptions, opts);
  const { abi, address } = await deploy(contractName, options);
  return new web3.eth.Contract(abi, address);
}

/**
 * @param {ExtendedTestBRE} buidlerRuntime
 * @param {string} owner - token owner address
 * @param {string[]} [holders] - token holders
 */
async function deployPaymentToken(buidlerRuntime, owner, holders= []) {
  const instance = await deployContract(
    buidlerRuntime,
    'SettlementToken',
    [],
    { from: owner },
  );
  await holders.reduce( // one by one
    (promiseChain, holder) => promiseChain.then(
      () => instance.methods.transfer(holder, web3.utils.toWei('10000')).send({ from: owner })
    ),
    Promise.resolve(),
  );
  return instance;
}

async function deployCMTA20FDT(buidlerRuntime, {
  name = 'CMTA 20',
  symbol = 'CMTA20',
  fundsToken,
  owner,
  initialAmount = 0,
}) {
  return deployContract(
    buidlerRuntime,
    'CMTA20FDT',
    [name, symbol, fundsToken, owner, initialAmount],
    { from: owner },
  );
}

async function deployICToken(buidlerRuntime, {
  assetRegistry,
  dataRegistryProxy,
  marketObjectCode,
  owner,
  deployer = '',
}) {
  return deployContract(
    buidlerRuntime,
    'ICT',
    [ assetRegistry, dataRegistryProxy, marketObjectCode, owner ],
    deployer ? { from: deployer } : undefined
  );
}

function parseToContractTerms(contract, terms) {
  return require('./ACTUS/parser').parseTermsFromObject(contract, terms);
}

async function getDefaultTerms (contract) {
  return require('./ACTUS/tests').getDefaultTestTerms(contract);
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
  deployContract,
  deployICToken,
  deployPaymentToken,
  deployCMTA20FDT,
  reuseOrDeployContract,
};
