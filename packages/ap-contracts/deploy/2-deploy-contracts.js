const log = require("debug")("buidler-deploy:2-deploy-contracts");

/**
 * @typedef {import('./0-create-namespace').UserBuidlerRuntimeEnvironment}
 * @typedef {import('./1-define-package').ContractsListItem}
 */

/** @type (UserBuidlerRuntimeEnvironment): {Promise<void>} */
module.exports = async (bre) => {
    if ( typeof bre.usrNs !== 'object' || typeof bre.usrNs.package !== 'object' ) {
        throw new Error("unexpected BuidlerRuntimeEnvironment");
    }

    const { deployments: {deploy}, usrNs, web3 } = bre;
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
                const { abi, address } = await deploy(
                    name,
                    Object.assign({}, defaultDeployOptions, deployOptions),
                );
                usrNs.instances[`${name}Instance`] = new web3.eth.Contract(abi, address);
            }
        ),
        Promise.resolve(),
    );

    log("done");
};
