const { isLinkingNeeded, linkLibraries } = require("../scripts/linkLibraries");

module.exports = linkBytecode;
module.exports.tags = ["_linking-tests"];
module.exports.dependencies = ["_deployment"];

/**
 * @typedef {import('./1-extend-buidler-env').UserBuidlerRuntimeEnvironment}
 * @typedef {import('./2-define-package').ContractsListItem}
 * @type (UserBuidlerRuntimeEnvironment): {Promise<void>}
 */
async function linkBytecode(bre) {

    if ( typeof bre.usrNs !== 'object' || typeof bre.usrNs.package !== 'object' ) {
        throw new Error("unexpected BuidlerRuntimeEnvironment");
    }

    const { deployments: { getArtifact, log }, usrNs } = bre;
    const { package: { contracts } } = usrNs;

    /** @type {ContractsListItem[]} contracts */
    contracts.map(async ({ name, instance, libraries }) => {
        const bytecode = instance.options.data;
        if (isLinkingNeeded(bytecode)) {
            const artifact = await getArtifact(name);
            instance.options.data = linkLibraries(artifact, libraries);
            log(`"${name}" linked`);
        }
    });
}
