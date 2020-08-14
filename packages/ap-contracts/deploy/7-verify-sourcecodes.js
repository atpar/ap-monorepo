module.exports = verifySourceCodes;
module.exports.tags = ["_verification"];
module.exports.dependencies = ["_deployment"];

/**
 * @typedef {import('./1-extend-buidler-env').UserBuidlerRuntimeEnvironment}
 * @type (UserBuidlerRuntimeEnvironment): {Promise<void>}
 */
async function verifySourceCodes(bre) {
    // TODO: implement source code verification on Etherscan and Sourcify.eth
    // shall be idempotent: do not re-submit source code for already verified contracts
    const { deployments: { log }} = bre;
    log("source code verification not yet implemented");
   return Promise.resolve();
}
