module.exports = deployContracts;
module.exports.tags = ["_deployment"];
module.exports.dependencies = ["_package"];

/**
 * @typedef {import('./1-extend-buidler-env').ExtendedBRE}
 *
 * @typedef Deployment {Object}
 * @property {string} metadata - contract metadata (by Solc)
 * @property {{name: string, address: string}} libraries - lib addresses to link
 * @property {any} instance - web3 Contract instance
 *
 * @typedef {import('./2-define-package').ContractsListItem} ContractsListDeployedItem
 * @typedef {import('./2-define-package').DiamondsListItem} DiamondsListDeployedItem
 * @property {Deployment} deployment
 */

/** @param {ExtendedBRE} buidlerRuntime */
async function deployContracts(buidlerRuntime) {

    const {
        deployments: { deploy, log },
        usrNs: { package: { contracts, diamonds, defaultDeployOptions }, helpers },
        getNamedAccounts
    } = buidlerRuntime;

    if (typeof contracts !== 'object' || typeof defaultDeployOptions !== 'object'|| typeof helpers !== 'object') {
        throw new Error("unexpected Buidler Runtime Environment");
    }

    helpers.replacePlaceholders = replacePlaceholders;

    const addresses = {};

    /** @type {DiamondsListDeployedItem[]} diamonds */
    await diamonds.reduce(
        // deploy one by one (but not in parallel)
        (promiseChain, diamond) => promiseChain.then(
            async () => {
                const { deployer } = await getNamedAccounts();
                diamond.deployment = await deployments.diamond.deploy(diamond.name, {
                    ...defaultDeployOptions,
                    from: deployer, // needs to be the admin for upgrade
                    owner: deployer,
                    facets: Object.values(diamond.facets).map(({ name }) => name),
                    deletePreviousDeployments: true
                });
            }
        ),
        Promise.resolve(),
    );

    /** @type {ContractsListDeployedItem[]} contracts */
    await contracts.reduce(
        // deploy one by one (but not in parallel)
        (promiseChain, contract) => promiseChain.then(
            async () => {
                const { name, deployable = true, getOptions, options: rawOptions } = contract;
                if (!deployable) return;

                const deployOptions = rawOptions
                    ? processRawOptions(rawOptions, addresses)
                    : (getOptions ? getOptions(buidlerRuntime) : {});
                
                log(`${name}: `);

                contract.deployment = await deploy(
                    name,
                    { ...defaultDeployOptions, ...deployOptions, log: false },
                );
                log(`    TxHash:           ${contract.deployment.receipt.transactionHash}`);
                log(`    Contract Address: ${contract.deployment.receipt.contractAddress}`);
                log(`    Gas Used:         ${contract.deployment.receipt.gasUsed.toString()}`);
                log(``);
                addresses[name] = contract.deployment.address;
            }
        ),
        Promise.resolve(),
    );
}

function processRawOptions(opts, addresses) {
    const sOpts = JSON.stringify(opts || {});
    return sOpts.search("{{") <= 0
        ? opts
        : JSON.parse(
            replacePlaceholders(sOpts, addresses, { keyRegexp: /{{([^}.]+)\.address}}/ }),
        );
}

/**
 * Replaces placeholders with values in a string  according to `valuesMap`
 * @param {string} str - the string to process
 * @param {{key: string, value: string}} values
 * @param {RegExp} [placeholderRegexp] - extracts placeholders from the string
 * @param {RegExp} [keyRegexp] - extracts the key from a placeholder
 * @return {string} processed string
 */
function replacePlaceholders(
    str,
    values,
    { placeholderRegexp = /{{[^}]+}}/g, keyRegexp = /{{([^}]+)}}/ } = {},
) {
    const placeholders = [];
    let match = placeholderRegexp.exec(str);
    while(match) {
        if (!placeholders.includes(match[0])) placeholders.push(match[0]);
        match = placeholderRegexp.exec(str);
    }

    return placeholders.length === 0 ? str : placeholders.reduce(
        (acc, placeholder) => {
            const key = placeholder.replace(keyRegexp, "$1");
            if (!key) throw new Error("invalid placeholder");
            if (typeof values[key] === "undefined") throw new Error(`unknown value for key "${key}"`);
            return acc
                .split(placeholder)
                .join(values[key]);
        }, str,
    );
}
