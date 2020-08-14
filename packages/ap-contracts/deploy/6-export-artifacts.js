const fs = require("fs");
const path = require('path');

module.exports = exportArtifacts;
module.exports.tags = ["_artifacts"];
module.exports.dependencies = ["_deployment"];

/**
 * @typedef {import('./1-extend-buidler-env').UserBuidlerRuntimeEnvironment}
 * @typedef {import('./2-define-package').ContractsListItem}
 * @type (UserBuidlerRuntimeEnvironment): {Promise<void>}
 */
async function exportArtifacts(bre) {

    if ( typeof bre.usrNs !== 'object' || typeof bre.usrNs.package !== 'object' ) {
        throw new Error("unexpected BuidlerRuntimeEnvironment");
    }
    const { deployments: { getArtifact, log }, usrNs: { package: { contracts }}} = bre;

    /** @type {ContractsListItem} contract */
    await Promise.all(contracts.map(async (contract) => {
        const { name, metadata } = contract;
        const { abi, bytecode, contractName, linkReferences } = await getArtifact(name);
        const artifact = JSON.stringify(
            { contractName, abi, metadata, bytecode, linkReferences },
            null,
            2,
         );
        const fileName = path.resolve(__dirname, '../artifacts/', `${name}.min.json`);
        return new Promise(res => fs.writeFile(fileName, artifact, 'utf8', res));
    }));

    log("artifacts exported");
}
