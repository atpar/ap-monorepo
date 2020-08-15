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

/** @param bre {ExtendedBRE} */
async function extendBuidlerEnv(bre) {
    if (typeof bre.usrNs !== 'undefined') throw new Error("unexpected Buidler Runtime Environment");

    const {  deployments: { log }, getNamedAccounts, getChainId, web3 } = bre;

    const { admin, deployer } = await getNamedAccounts();
    const chainId = `${await getChainId()}`;

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

    bre.usrNs = {
        chainId,
        accounts,
        roles,
        package: {},
        helpers: {},
    };

    log(`Buidler Runtime Environment extended, chainId: ${chainId}`);
}
