const fs = require("fs");
const path = require('path');

module.exports = updateDeploymentsJson;
module.exports.tags = ["_export"];
module.exports.dependencies = ["_env", "_deployment"];

/** @param {import('./1-extend-buidler-env').ExtendedBRE} bre */
async function updateDeploymentsJson(bre) {

    const {  deployments: { log }, usrNs: { chainId, package: { contracts }}} = bre;

    if ( !chainId || !contracts ) {
        throw new Error("unexpected Buidler Runtime Environment");
    }

    const deploymentsFile = path.resolve(__dirname, '../', 'deployments.json');
    const deployments = JSON.parse(fs.readFileSync(deploymentsFile, 'utf8'));

    /** @type {import('./3-deploy-contracts').ContractsListDeployedItem[]} deployed */
    const deployed = contracts;
    deployments[chainId] = deployed.reduce(
        (acc, { name, exportDeployment = false, deployment: { address } }) => {
            if (exportDeployment) {
                acc[name] = address;
                if (!acc[name]) throw new Error('unexpected address');
            }
            return acc;
        },
        {},
    );

    await new Promise(
        res => fs.writeFile(deploymentsFile, JSON.stringify(deployments, null, 2), 'utf8', res)
    );

    log("deployments.json updated");
}
