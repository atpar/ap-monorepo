module.exports = extendBuidlerEnv;
module.exports.tags = ["_env"];

/**
 * @typedef {Object} BuidlerRuntimeEnvironment (https://github.com/wighawag/buidler-deploy#environment-extensions)
 *
 * @typedef {BuidlerRuntimeEnvironment} UserBuidlerRuntimeEnvironment - extended environment
 * @property {Object} usrNs - user namespace
 */

/** @param bre {UserBuidlerRuntimeEnvironment} */
async function extendBuidlerEnv(bre) {
    if (typeof bre.usrNs === 'undefined') bre.usrNs = {};
    if (typeof bre.usrNs !== 'object') throw new Error("unexpected BuidlerRuntimeEnvironment");

    const {  deployments: { log }, getNamedAccounts, getChainId, usrNs, web3 } = bre;

    usrNs.chainId = `${await getChainId()}`;
    log(`ChainId: ${usrNs.chainId}`);

    usrNs.isBuidlerEvm = usrNs.chainId === '31337';

    usrNs.accounts = await web3.eth.getAccounts();
    const { admin, deployer } = await getNamedAccounts();
    usrNs.roles = {
        deployer: deployer || usrNs.accounts[0],
        admin: admin || (usrNs.isBuidlerEvm ? usrNs.accounts[1] : usrNs.accounts[0]),
    }

    Object.keys(usrNs.roles).forEach(
        (key) => {
            if (!web3.utils.isAddress(usrNs.roles[key]))
                throw new Error(`invalid address: ${key}`);
        }
    );
}
