module.exports = assertDeployerBalance;
module.exports.tags = ["_balance"];
module.exports.dependencies = ["_env"];

/**
 * @typedef {import('./1-extend-buidler-env').ExtendedBRE}
 * @param {ExtendedBRE} buidlerRuntime
 */
async function assertDeployerBalance(buidlerRuntime) {

    const { deployments: { log }, usrNs: { roles: { deployer } }, web3 } = buidlerRuntime;

    if ( !web3.utils.isAddress(deployer) ) {
        throw new Error("unexpected Buidler Runtime Environment");
    }
    const balance = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(deployer), 'ether'));
    if( balance < 0.5 ) {
        log(`ATTENTION!!! low deployer balance: ${balance} ether`);
    } else {
        log(`deployer balance: ${balance} ether`);
    }
}
