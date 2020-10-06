const fs = require("fs");
const path = require('path');

module.exports = updateAddressesJson;
module.exports.tags = ["_export"];
module.exports.dependencies = ["_env", "_deployment"];

/** @param {import('./1-extend-buidler-env').ExtendedBRE} buidlerRuntime */
async function updateAddressesJson(buidlerRuntime) {

    const {  deployments: { log }, usrNs: { chainId, package: { contracts }}} = buidlerRuntime;

    if (!chainId || !contracts) {
        throw new Error('Unexpected Buidler Runtime Environment');
    }

    const addressesFile = path.resolve(__dirname, '../ap-chain', 'addresses.json');

    if (!fs.existsSync(addressesFile)) {
        fs.writeFileSync(addressesFile, JSON.stringify({}, null, 2), { encoding: 'utf-8', flag: 'w'});
    }

    let addresses = JSON.parse(fs.readFileSync(addressesFile, 'utf8'));

    /** @type {import('./3-deploy-contracts').ContractsListDeployedItem[]} deployed */
    const deployed = contracts;
    addresses = deployed.reduce(
        (acc, { name, deployable = true, exportable = true, deployment }) => {
            if (deployable && exportable) {
                acc[name] = deployment.address;
                if (!acc[name]) throw new Error('Undefined address');
            }
            return acc;
        },
        {},
    );

    await new Promise(
        (res, rej) => fs.writeFile(
            addressesFile,
            JSON.stringify(addresses, null, 2),
            { encoding: 'utf8', flag: 'w' },
            (err) => {
                if (err) return rej(err);
                log(`addresses.json saved`);
                res();
            }
        )
    );
}
