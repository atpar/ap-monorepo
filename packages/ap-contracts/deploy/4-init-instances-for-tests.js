const { isLinkingNeeded, linkLibraries } = require("../scripts/linkLibraries");

module.exports = initInstances;
module.exports.tags = ["_instances-tests"];
module.exports.dependencies = ["_env-tests", "_deployment"];

/** @param {import('./1-extend-buidler-env-for-tests').ExtendedTestBRE} bre */
async function initInstances(bre) {

    if ( typeof bre.usrNs !== 'object' || typeof bre.usrNs.package !== 'object' ) {
        throw new Error("unexpected Buidler Runtime Environment");
    }

    const { deployments: { getArtifact, log }, usrNs, web3 } = bre;
    const { package: { contracts } } = usrNs;

    await Promise.all(
        /** @type {import('./2-define-package').ContractsListItem[]} contracts */
        contracts.map(async ({ name, deployment: { abi, address, bytecode, libraries }}) => {

            const instance = new web3.eth.Contract(abi, address);
            if (isLinkingNeeded(bytecode)) {
                const artifact = await getArtifact(name);
                instance.options.data = linkLibraries(artifact, libraries);
                log(`"${name}" linked`);
            } else {
                instance.options.data = bytecode;
            }
            usrNs.instances[`${name}Instance`] = instance;
        }),
    );
}
