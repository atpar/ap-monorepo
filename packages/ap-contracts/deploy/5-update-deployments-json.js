const fs = require("fs");
const path = require('path');
const log = require("debug")("buidler-deploy:5-update-deployments-json");

/**
 * @typedef {import('./0-create-namespace').UserBuidlerRuntimeEnvironment}
 * @typedef {import('./1-define-package').ContractsListItem}
 * @typedef {import('./2-deploy-contracts').Instances}
 */

/** @param {UserBuidlerRuntimeEnvironment} bre */
module.exports = async (bre) => {
    /**
     * @type {ContractsListItem[]} contracts
     * @type {Instances} instances - web3.js Contract objects
     */
    const {usrNs: {chainId, package: {contracts}, instances}} = bre;

    if (!chainId || !contracts || !instances) {
        throw new Error("unexpected UserBuidlerRuntimeEnvironment");
    }

    const deploymentsFile = path.resolve(__dirname, '../', 'deployments.json');
    const deployments = JSON.parse(fs.readFileSync(deploymentsFile, 'utf8'));

    deployments[chainId] = contracts.reduce(
        (acc, { name, exportDeployment = false }) => {
            if (exportDeployment) {
                acc[name] = instances[`${name}Instance`].options.address;
            }
            return acc;
        },
        {},
    );

    fs.writeFileSync(deploymentsFile, JSON.stringify(deployments, null, 2), 'utf8');

    log("done");
};
