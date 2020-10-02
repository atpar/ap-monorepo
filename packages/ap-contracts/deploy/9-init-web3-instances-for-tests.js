const { isLinkingNeeded, linkLibraries } = require("../scripts/linkLibraries");

module.exports = initInstances;
module.exports.tags = ["_instances-tests"];

/** @param {import('./1-extend-buidler-env-for-tests').ExtendedTestBRE} buidlerRuntime */
async function initInstances(buidlerRuntime) {
    if ( typeof buidlerRuntime.usrNs !== 'object' || typeof buidlerRuntime.usrNs.package !== 'object' ) {
        throw new Error("unexpected Buidler Runtime Environment");
    }

    const { deployments: { getArtifact, log }, usrNs, web3 } = buidlerRuntime;
    const { package: { contracts } } = usrNs;

    await Promise.all(
        /** @type {import('./2-define-package').ContractsListItem[]} contracts */
        contracts.map(async ({ name, deployable = true, deployment }) => {
            if (!deployable) {
                return;
            }

            const { abi, address, bytecode, libraries } = deployment;
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
