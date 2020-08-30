module.exports = deployAndInitSettlementToken;
module.exports.tags = ["extra-settlement-token"];
module.exports.runAtTheEnd = true;

/**
 * Usage:
 * { SettlementToken: { abi, address <, ...> }} = await buidlerRuntime.deployments.run("extra-settlement-token")
 * @param {import('./1-extend-buidler-env-for-tests').ExtendedTestBRE} buidlerRuntime
 */
async function deployAndInitSettlementToken(buidlerRuntime) {
    const {
        deployments: { deploy, log },
        usrNs: { roles },
        web3,
    } = buidlerRuntime;
    const owner = ( roles.SettlementToken ? roles.SettlementToken.owner : '' ) || roles.deployer;
    if ( !owner ) throw new Error("defined nor deployer neither owner");

    const {  abi, address } = await deploy("SettlementToken", { from: owner });
    const instance = new web3.eth.Contract(abi, address);
    if ( roles.SettlementToken && roles.SettlementToken.holders ) {
        for (let holder of roles.SettlementToken.holders) {
            await instance.methods.transfer(holder, web3.utils.toWei('5000')).send({ from: owner });
        }
    }
    log(`Settlement Token deployed at ${address}`);
}
