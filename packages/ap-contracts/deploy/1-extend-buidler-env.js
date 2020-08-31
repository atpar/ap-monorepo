module.exports = extendBuidlerEnv;
module.exports.tags = ["_env"];

/**
 * @typedef {Object} BuidlerRuntimeEnvironment (https://github.com/wighawag/buidler-deploy#environment-extensions)
 *
 * @typedef  {{name: string: address: string}} Roles
 * @typedef UserNamespace
 * @property {String} chainId
 * @property {String[]} accounts
 * @property {Roles}  roles
 * @property {import('./2-define-package').Package} package
 * @property {{name: string, helper:any}} helpers - misc helper functions
 *
 * @typedef {BuidlerRuntimeEnvironment} ExtendedBRE - extended Builder Runtime Environment
 * @property {UserNamespace} usrNs - extension
 */

/** @param buidlerRuntime {ExtendedBRE} */
async function extendBuidlerEnv(buidlerRuntime) {
    if (typeof buidlerRuntime.usrNs !== 'undefined') throw new Error("unexpected Buidler Runtime Environment");

    const {  deployments: { log }, getNamedAccounts, getChainId, web3 } = buidlerRuntime;

    const { admin, deployer } = await getNamedAccounts();
    const id = `${await getChainId()}`;

    // ganache hardcoded to return 1337 on 'eth_chainId' RPC request that buidler uses
    const chainId = ( id === '1337' ) ? `${await web3.eth.net.getId()}` : id;

    const accounts = await web3.eth.getAccounts();
    const roles = {
        deployer: deployer || accounts[0],
        admin: admin || accounts[1] || accounts[0],
    };
    Object.keys(roles).forEach(
        (key) => {
            if (!web3.utils.isAddress(roles[key])) {
                throw new Error(`invalid address for role: ${key}`);
            }
        }
    );

    if (!web3.eth.Contract.defaultAccount) {
        web3.eth.Contract.defaultAccount = deployer;
    }

    buidlerRuntime.usrNs = {
        chainId,
        accounts,
        roles,
        package: {},
        helpers: {},
    };

    log(`Buidler Runtime Environment extended, chainId: ${chainId}`);
}
