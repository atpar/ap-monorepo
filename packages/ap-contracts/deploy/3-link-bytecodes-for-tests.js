const { isLinkingNeeded, linkLibraries } = require("../scripts/linkLibraries");

module.exports = linkBytecode;
module.exports.tags = ["_linking-tests"];
module.exports.dependencies = ["_deployment"];

/** @param {import('./1-extend-buidler-env').ExtendedBRE} bre */
async function linkBytecode(bre) {

    if ( typeof bre.usrNs !== 'object' || typeof bre.usrNs.package !== 'object' ) {
        throw new Error("unexpected Buidler Runtime Environment");
    }

    const { deployments: { getArtifact, log }, usrNs } = bre;
    const { package: { contracts } } = usrNs;

    /**
     * @typedef Instances {{name: string, instance: any}} - web3 Contract objects, name: contract name + 'Instance'
     * @property {Instances} usrNs.instances
     */
    if (!usrNs.instances) usrNs.instances = {};

    await Promise.all(
        /** @type {import('./2-define-package').ContractsListItem[]} contracts */
        contracts.map(async ({ name, instance, libraries }) => {
            const bytecode = instance.options.data;
            if (isLinkingNeeded(bytecode)) {
                const artifact = await getArtifact(name);
                instance.options.data = linkLibraries(artifact, libraries);
                log(`"${name}" linked`);
            }
            usrNs.instances[`${name}Instance`] = instance;
        }),
    );
}
