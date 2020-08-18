module.exports = initContracts;
module.exports.tags = ["_init"];
module.exports.dependencies = ["_env", "_deployment"];

/** @param {import('./1-extend-buidler-env').ExtendedBRE} bre */
async function initContracts(bre) {

    const { usrNs: { helpers }} = bre;
    if ( typeof helpers !== "object" ) {
        throw new Error("unexpected Buidler Runtime Environment");
    }
    helpers.registerActor = registerActor;

    await registerActor(bre,"ANNRegistry", "ANNActor");
    await registerActor(bre,"CECRegistry", "CECActor");
    await registerActor(bre,"CEGRegistry", "CEGActor");
    await registerActor(bre,"CERTFRegistry", "CERTFActor");
    await registerActor(bre,"PAMRegistry", "PAMActor");
}

/**
 * @param {import('./1-extend-buidler-env').ExtendedBRE} bre
 * @param {string} registry - Contract name
 * @param {string} actor  - address or Contract name
 */
async function registerActor(bre, registry, actor) {
    const {
        deployments: { log },
        usrNs: { roles: {deployer}, package: { contracts } },
        web3,
    } = bre;

    /** @type {import('./3-deploy-contracts').ContractsListDeployedItem[]} instances */
    const instances = contracts;
    const contract = instances.find(i => i.name === registry);
    if (!contract) throw new Error("invalid registry contract");

    const { deployment } = contract;
    const instance = new web3.eth.Contract(deployment.abi, deployment.address);

    const address = web3.utils.isAddress(actor)
        ? actor
        : instances.find(i => i.name === actor).deployment.address;
    if (!web3.utils.isAddress(address)) throw new Error("invalid actor address");

    if (await instance.methods.approvedActors(address).call()) {
        log(`${address} already registered with ${registry} as actor`);
    } else {
        // TODO: make it idempotent - avoid re-sending pending transactions
        await instance.methods.approveActor(address).send({
            from: deployer,
            gas: 100000,
        });
        log(`${address} has been registered with ${registry} as actor`);
    }
}
