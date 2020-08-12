module.exports = initContracts;
module.exports.tags = ["_init"];
module.exports.dependencies = ["_env", "_deployment"];

/**
 * @typedef {import('./1-extend-buidler-env').UserBuidlerRuntimeEnvironment}
 * @typedef {import('./3-deploy-contracts').Instances}
 * @param {UserBuidlerRuntimeEnvironment} bre
 */
async function initContracts(bre) {
    /**
     * @type {Instances} instances - web3.js Contract objects
     */
    const { deployments: { log }, usrNs: { roles: {deployer}, instances }, web3} = bre;
    if (!deployer || !instances) {
        throw new Error("unexpected UserBuidlerRuntimeEnvironment");
    }

    const txOpts = {
        from: deployer,
        gas: 100000,
    };

    await registerActor("ANNRegistryInstance", "ANNActorInstance");
    await registerActor("CECRegistryInstance", "CECActorInstance");
    await registerActor("CEGRegistryInstance", "CEGActorInstance");
    await registerActor("CERTFRegistryInstance", "CERTFActorInstance");

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
