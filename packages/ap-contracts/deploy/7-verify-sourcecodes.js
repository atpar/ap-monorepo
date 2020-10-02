module.exports = verifySourceCodes;
module.exports.tags = ["_verification"];
module.exports.dependencies = ["_deployment"];

// run on public nets only
module.exports.skip = ({ usrNs: { chainId }}) => Promise.resolve(parseInt(chainId) > 9);

/** @param {import('./1-extend-buidler-env').ExtendedBRE} buidlerRuntime */
async function verifySourceCodes(buidlerRuntime) {
    // TODO: implement source code verification on Etherscan and Sourcify.eth
    // nice-to-have: do not re-submit source code for already verified contracts
    const { deployments: { log }} = buidlerRuntime;
    log("source code verification not yet implemented");
   return Promise.resolve();
}
