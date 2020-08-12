module.exports = initExtraContractsForTests;
module.exports.tags = ["_init-tests"];
module.exports.dependencies = ["_env", "_env-tests", "_deployment"];

// never run on the mainnet
module.exports.skip = ({ usrNs: { chainId }}) => Promise.resolve(parseInt(chainId) < 2);

/**
 * @typedef {import('./1-extend-buidler-env').UserBuidlerRuntimeEnvironment}
 * @typedef {import('./3-deploy-contracts').Instances}
 * @param {UserBuidlerRuntimeEnvironment} bre
 */
async function initExtraContractsForTests(bre) {
    /**
     * @type {Instances} instances - web3.js Contract objects
     */
    const { deployments: { log }, usrNs: { instances, roles: {admin, deployer, defaultActor}}, web3} = bre;
    if (!deployer || !instances) {
        throw new Error("unexpected UserBuidlerRuntimeEnvironment");
    }

    const txOpts = {
        from: deployer,
        gas: 100000,
    };

    await registerActor("ANNRegistryInstance", admin);
    await registerActor("CECRegistryInstance", admin);
    await registerActor("CEGRegistryInstance", admin);
    await registerActor("CERTFRegistryInstance", admin);

    await registerActor("ANNRegistryInstance", defaultActor);
    await registerActor("CECRegistryInstance", defaultActor);
    await registerActor("CEGRegistryInstance", defaultActor);
    await registerActor("CERTFRegistryInstance", defaultActor);

    async function registerActor(registry, actor) {
        const instance = instances[registry];
        const address = web3.utils.isAddress(actor) ? actor: instances[actor].options.address;

        if (!instance || !address) {
            throw new Error("invalid registry or actor");
        }
        if (await instance.methods.approvedActors(address).call()) {
            log(`${address} already registered with ${registry} as actor`);
        } else {
            // TODO: make it idempotent (avoid re-sending pending transactions)
            await instance.methods.approveActor(address).send(txOpts);
            log(`${address} has been registered with ${registry} as actor`);
        }
    }
}
