module.exports = verifySourceCodes;
module.exports.tags = ["_verification"];
module.exports.dependencies = ["_deployment"];

/** @param {import('./1-extend-buidler-env').ExtendedBRE} bre */
async function verifySourceCodes(bre) {
    // TODO: implement source code verification on Etherscan and Sourcify.eth
    // nice-to-have: do not re-submit source code for already verified contracts
    const { deployments: { log }} = bre;
    log("source code verification not yet implemented");
   return Promise.resolve();
}
