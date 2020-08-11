const log = require("debug")("buidler-deploy:0-create-namespace");

/**
 * @typedef {Object} BuidlerRuntimeEnvironment (https://github.com/wighawag/buidler-deploy#environment-extensions)
 *
 * @typedef {BuidlerRuntimeEnvironment} UserBuidlerRuntimeEnvironment - extended environment
 * @property {Object} usrNs - user namespace extension
 */

/** @param bre {UserBuidlerRuntimeEnvironment} */
module.exports = async (bre) => {
    if (typeof bre.usrNs === 'undefined') bre.usrNs = {};
    if (typeof bre.usrNs !== 'object') throw new Error("unexpected BuidlerRuntimeEnvironment");

    const { getNamedAccounts, getChainId, web3, usrNs } = bre;

    usrNs.chainId = `${await getChainId()}`;
    log(`ChainId: ${usrNs.chainId}`);

    usrNs.isBuidlerEvm = usrNs.chainId === '31337';

    if (!usrNs.isBuidlerEvm && usrNs.chainId !== '3') {
        throw new Error('buidlerevm or ropsten networks allowed only');
    }

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

    log("done");
};
