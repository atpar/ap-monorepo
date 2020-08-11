const log = require("debug")("buidler-deploy:3-init-contracts");

/**
 * @typedef {import('./0-create-namespace').UserBuidlerRuntimeEnvironment}
 * @typedef {import('./2-deploy-contracts').Instances}
 */

/** @param {UserBuidlerRuntimeEnvironment} bre */
module.exports = async (bre) => {
    /**
     * @type {Instances} instances - web3.js Contract objects
     */
    const {usrNs: { roles: {deployer}, instances }} = bre;
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
        const address = instances[actor].options.address;

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

    // TODO: approve Actors for the Asset Registries
    // await instances.ANNRegistryInstance.approveActor(admin);
    // await instances.ANNRegistryInstance.approveActor(defaultActor);
    // await instances.CECRegistryInstance.approveActor(admin);
    // await instances.CECRegistryInstance.approveActor(defaultActor);
    // await instances.CEGRegistryInstance.approveActor(defaultActor);
    // await instances.CEGRegistryInstance.approveActor(admin);
    // await instances.CERTFRegistryInstance.approveActor(admin);
    // await instances.CERTFRegistryInstance.approveActor(defaultActor);
    // await instances.PAMRegistryInstance.approveActor(admin);
    // await instances.PAMRegistryInstance.approveActor(instances.PAMActorInstance.address);
    // await instances.PAMRegistryInstance.approveActor(defaultActor);

    log("done");
};
