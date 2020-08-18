const fs = require("fs");
const path = require('path');

module.exports = exportArtifacts;
module.exports.tags = ["_artifacts"];
module.exports.dependencies = ["_package"];

/** @param {import('./1-extend-buidler-env').ExtendedBRE} bre */
async function exportArtifacts(bre) {

    if ( typeof bre.usrNs !== 'object' || typeof bre.usrNs.package !== 'object' ) {
        throw new Error("unexpected Buidler Runtime Environment");
    }
    const { deployments: { getArtifact, log }, usrNs: { package: { contracts }}} = bre;

    /** @param {import('./3-deploy-contracts').ContractsListDeployedItem} contract */
    await Promise.all(contracts.map(async (contract) => {
        if (!contract.exportDeployment) return Promise.resolve();

        const { name, metadata, options: deployOptions } = contract;
        const { abi, bytecode, contractName, linkReferences } = await getArtifact(name);
        const artifact = JSON.stringify(
            { contractName, abi, metadata, bytecode, linkReferences, deployOptions },
            null,
            2,
         );

        const fileName = path.resolve(__dirname, '../artifacts/', `${name}.min.json`);
        return new Promise(res => fs.writeFile(fileName, artifact, 'utf8', res));
    }));

    log("artifacts exported");
}
