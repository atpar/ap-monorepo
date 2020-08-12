module.exports = deployContracts;
module.exports.tags = ["_deployment"];
module.exports.dependencies = ["_package"];

/**
 * @typedef {import('./1-extend-buidler-env').UserBuidlerRuntimeEnvironment}
 * @typedef {import('./2-define-package').ContractsListItem}
 * @type (UserBuidlerRuntimeEnvironment): {Promise<void>}
 */
async function deployContracts(bre) {

    if ( typeof bre.usrNs !== 'object' || typeof bre.usrNs.package !== 'object' ) {
        throw new Error("unexpected BuidlerRuntimeEnvironment");
    }

    const { deployments: { deploy, log }, usrNs, web3 } = bre;
    const { package: { defaultDeployOptions, contracts } } = usrNs;

    /** @typedef {Object[]} Instances - key (contract name + 'Instance') to value (web3.js Contract object) pairs */
    if (!usrNs.instances) usrNs.instances = {};

    /** @type {ContractsListItem[]} contracts */
    await contracts.reduce(
        // deploy one by one (but not in parallel)
        (promiseChain, contract) => promiseChain.then(
            async () => {
                const { name, getOptions } = contract;
                const deployOptions = contract.options || (getOptions ? getOptions(bre) : {});
                log(`"${name}" ...`);
                const { abi, address } = await deploy(
                    name,
                    Object.assign({}, defaultDeployOptions, deployOptions),
                );
                usrNs.instances[`${name}Instance`] = new web3.eth.Contract(abi, address);
            }
        ),
        Promise.resolve(),
    );
}
