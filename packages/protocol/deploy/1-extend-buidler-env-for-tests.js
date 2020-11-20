module.exports = extendBuidlerEnvForTests;
module.exports.tags = ["_env-tests"];
module.exports.dependencies = ["_env"];

/**
 * @typedef {import('./1-extend-buidler-env').ExtendedBRE}
 * @typedef Instances {{name: string, instance: any}} - web3 Contract objects, name: contract name + 'Instance'
 * @typedef {ExtendedBRE} ExtendedTestBRE
 * @property {Instances} instances
 */

/** @param {ExtendedBRE} buidlerRuntime */
async function extendBuidlerEnvForTests(buidlerRuntime) {

  const { deployments: { log }, usrNs, web3 } = buidlerRuntime;
  const { accounts, roles } = usrNs;

  if (!usrNs.instances) usrNs.instances = {};

  roles.defaultActor = checkAddress(accounts[2]);
  log(`roles: ${JSON.stringify(roles, null, 2)}`);

  // shall be async
  return Promise.resolve();

  function checkAddress(address) {
    if (!web3.utils.isAddress(address)) {
      throw new Error(`invalid address ${address}`);
    }
    return address;
  }
}
