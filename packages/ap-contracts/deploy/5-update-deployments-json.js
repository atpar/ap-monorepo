const fs = require("fs");
const path = require('path');

module.exports = updateDeploymentsJson;
module.exports.tags = ["_export"];
module.exports.dependencies = ["_env", "_deployment"];

/**
 * @typedef {import('./1-extend-buidler-env').UserBuidlerRuntimeEnvironment}
 * @typedef {import('./2-define-package').ContractsListItem}
 * @typedef {import('./3-deploy-contracts').Instances}
 * @param {UserBuidlerRuntimeEnvironment} bre
 */
async function updateDeploymentsJson(bre) {

    /** @type {Instances} instances - web3.js Contract objects */
    const {  deployments: { log }, usrNs: { chainId, instances, package: { contracts }}} = bre;

    if ( !chainId || !contracts || !instances ) {
        throw new Error("unexpected UserBuidlerRuntimeEnvironment");
    }

    const deploymentsFile = path.resolve(__dirname, '../', 'deployments.json');
    const deployments = JSON.parse(fs.readFileSync(deploymentsFile, 'utf8'));

    /** @property {ContractsListItem[]} contracts */
    deployments[chainId] = contracts.reduce(
        (acc, { name, exportDeployment = false }) => {
            if (exportDeployment) {
                acc[name] = instances[`${name}Instance`].options.address;
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
