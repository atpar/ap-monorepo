const fs = require("fs");
const path = require('path');

module.exports = updateDeploymentsJson;
module.exports.tags = ["_export"];
module.exports.dependencies = ["_env", "_deployment"];

/** @param {import('./1-extend-buidler-env').ExtendedBRE} buidlerRuntime */
async function updateDeploymentsJson(buidlerRuntime) {

    const {  deployments: { log }, usrNs: { chainId, package: { contracts }}} = buidlerRuntime;

    if (!chainId || !contracts) {
        throw new Error("unexpected Buidler Runtime Environment");
    }

    // store addresses for ap-chain in ap-chain-snapshot
    const deploymentsFile = (chainId !== '1994')
        ? path.resolve(__dirname, '../', 'deployments.json')
        : path.resolve(__dirname, '../ap-chain-snapshot', 'deployments.json');

    if (!fs.existsSync(deploymentsFile)) {
        fs.writeFileSync(deploymentsFile, JSON.stringify({}, null, 2), { encoding: 'utf-8', flag: 'w'});
    }

    const deployments = JSON.parse(fs.readFileSync(deploymentsFile, 'utf8'));

    /** @type {import('./3-deploy-contracts').ContractsListDeployedItem[]} deployed */
    const deployed = contracts;
    deployments[chainId] = deployed.reduce(
        (acc, { name, deployable = true, exportable = true, deployment }) => {
            if (deployable && exportable) {
                acc[name] = deployment.address;
                if (!acc[name]) throw new Error('unexpected address');
            }
            return acc;
        },
        {},
    );

    await new Promise(
        (res, rej) => fs.writeFile(
            deploymentsFile,
            JSON.stringify(deployments, null, 2),
            { encoding: 'utf8', flag: 'w' },
            (err) => {
                if (err) return rej(err);
                log(`deployments.json saved`);
                res();
            }
        )
    );
}
