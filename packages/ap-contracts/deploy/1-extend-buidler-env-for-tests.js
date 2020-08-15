module.exports = extendBuidlerEnvForTests;
module.exports.tags = ["_env-tests"];
module.exports.dependencies = ["_env"];

/** @param {import('./1-extend-buidler-env').ExtendedBRE} bre */
async function extendBuidlerEnvForTests(bre) {

    const { deployments: { log }, usrNs: { accounts, roles }, web3 } = bre;

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
