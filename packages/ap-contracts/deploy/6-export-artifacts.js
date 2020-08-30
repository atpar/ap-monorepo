const fs = require("fs");
const path = require('path');

module.exports = exportArtifacts;
module.exports.tags = ["_artifacts"];
module.exports.dependencies = ["_package"];

/** @param {import('./1-extend-buidler-env').ExtendedBRE} buidlerRuntime */
async function exportArtifacts(buidlerRuntime) {

    if ( typeof buidlerRuntime.usrNs !== 'object' || typeof buidlerRuntime.usrNs.package !== 'object' ) {
        throw new Error("unexpected Buidler Runtime Environment");
    }
    const { deployments: { getArtifact, log }, usrNs: { package: { contracts }}} = buidlerRuntime;

    /** @param {import('./3-deploy-contracts').ContractsListDeployedItem} contract */
    await Promise.all(contracts.map(async (contract) => {
        if (!contract.exportDeployment) return Promise.resolve();

        const { name, deployment: { metadata }, options: deployOptions } = contract;
        const { abi, bytecode, contractName, linkReferences } = await getArtifact(name);
        const artifact = JSON.stringify(
            { contractName, abi, metadata, bytecode, linkReferences, deployOptions },
            null,
            2,
        );

        const fileName = path.resolve(__dirname, '../artifacts/', `${name}.min.json`);
        return new Promise((res, rej) => fs.writeFile(
            fileName,
            artifact,
            'utf8',
            (err) => {
                if(err) return rej(err);
                log(`artifacts saved: ${fileName}`);
                res();
            }
        ));
    }));
}
