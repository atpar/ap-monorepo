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
     buidler runs deployment scripts then creates the "global" snapshot for tags specified
     */
    await buidlerRuntime.deployments.fixture("u-tests");

    /*
     on the first call of a (function) instance that `getSnapshotTaker` returns,
     buidler runs the code that follows and then creates an "instance specific" snapshot
     (on further calls of this instance, buidler re-uses this snapshot, skipping the code)
     */

    if (self) {
      // inject into `self` the web3.eth.Contract instances of deployed contracts
      Object.keys(buidlerRuntime.usrNs.instances)
          .forEach((name) => self[name] = buidlerRuntime.usrNs.instances[name]);
      // ... and a "fresh" copy of accounts
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
 * @param {ExtendedTestBRE} buidlerRuntime
 * @param {string} owner - token owner address
 * @param {string[]} [holders] - token holders
 */
async function deployPaymentToken(buidlerRuntime, owner, holders= []) {
  const { deployments: { deploy }, web3 } = buidlerRuntime;
  const { abi, address } = await deploy("SettlementToken", {
    from: owner,
    // deploy a new instance rather than re-use the one already deployed with another "from" address
    fieldsToCompare: [ "data", "from" ],
  });
  const instance = new web3.eth.Contract(abi, address);

  for (let holder of holders) {
    await instance.methods.transfer(holder, web3.utils.toWei('10000')).send({ from: owner });
  }

  return instance;
}

/**
 * @param {ExtendedTestBRE} buidlerRuntime
 */
async function deployVanillaFDT(buidlerRuntime, {
  name = 'FundsDistributionToken',
  symbol = 'FDT',
  fundsToken,
  owner,
  initialAmount = 0,
})
{
  const { deployments: { deploy }, web3 } = buidlerRuntime;
  const { abi, address } = await deploy("VanillaFDT", {
    args: [name, symbol, fundsToken, owner, initialAmount],
    from: owner,
    // deploy a new instance rather than re-use the one already deployed with another "from" address
    fieldsToCompare: [ "data", "from" ],
  });
  return new web3.eth.Contract(abi, address);
}

/**
 * @param {ExtendedTestBRE} buidlerRuntime
 */
async function deploySimpleRestrictedFDT(buidlerRuntime, {
  name = 'FundsDistributionToken',
  symbol = 'FDT',
  fundsToken,
  owner,
  initialAmount = 0,
})
{
  const { deployments: { deploy }, web3 } = buidlerRuntime;
  const { abi, address } = await deploy("SimpleRestrictedFDT", {
    args: [name, symbol, fundsToken, owner, initialAmount],
    from: owner,
    // deploy a new instance rather than re-use the one already deployed with another "from" address
    fieldsToCompare: [ "data", "from" ],
  });
  return new web3.eth.Contract(abi, address);
}

/**
 * @param {ExtendedTestBRE} buidlerRuntime
 */
async function deployCMTA20FDT(buidlerRuntime, {
  name = 'CMTA 20',
  symbol = 'CMTA20',
  fundsToken,
  owner,
  initialAmount = 0,
})
{
  const { deployments: { deploy }, web3 } = buidlerRuntime;
  const { abi, address } = await deploy("CMTA20FDT", {
    args: [name, symbol, fundsToken, owner, initialAmount],
    from: owner,
    // deploy a new instance rather than re-use the one already deployed with another "from" address
    fieldsToCompare: [ "data", "from" ],
  });
  return new web3.eth.Contract(abi, address);
}

/**
 * @param {ExtendedTestBRE} buidlerRuntime
 */
async function deployRuleEngineMock(buidlerRuntime, { owner }) {
  const { deployments: { deploy }, web3 } = buidlerRuntime;
  const { abi, address } = await deploy("RuleEngineMock", {
    args: [],
    from: owner,
    // deploy a new instance rather than re-use the one already deployed with another "from" address
    fieldsToCompare: [ "data", "from" ],
  });
  return new web3.eth.Contract(abi, address);
}

/** @param {ExtendedTestBRE} buidlerRuntime */
async function deployICToken(buidlerRuntime, {
  assetRegistry,
  dataRegistry,
  marketObjectCode,
  deployer = '',
})
{
  const { deployments: { getArtifact }, usrNs: { roles: { deployer: defaultDeployer }}, web3 } = buidlerRuntime;
  const { abi, bytecode } = await getArtifact("ICT");
  const instance = new web3.eth.Contract(abi);
  return (await instance
          // bytecode linking is unneeded for this contract
          .deploy({ data: bytecode, arguments: [ assetRegistry, dataRegistry, marketObjectCode ]})
          .send({ from: deployer || defaultDeployer })
  );
}

/** @param {ExtendedTestBRE} buidlerRuntime */
async function deployDvPSettlement(buidlerRuntime, deployer = '')
{
  const { deployments: { getArtifact }, usrNs: { roles: { deployer: defaultDeployer }}, web3 } = buidlerRuntime;
  const { abi, bytecode } = await getArtifact("DvPSettlement");
  const instance = new web3.eth.Contract(abi);
  return (await instance
          // bytecode linking is unneeded for this contract
          .deploy({ data: bytecode })
          .send({ from: deployer || defaultDeployer })
  );
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
  deployDvPSettlement,
  deployICToken,
  deployPaymentToken,
  deploySimpleRestrictedFDT,
  deployVanillaFDT,
  deployCMTA20FDT,
  deployRuleEngineMock
};
