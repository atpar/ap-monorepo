module.exports = initContracts;
module.exports.tags = ["_init"];
module.exports.dependencies = ["_env", "_deployment"];

/** @param {import('./1-extend-buidler-env').ExtendedBRE} buidlerRuntime */
async function initContracts(buidlerRuntime) {

    const { usrNs: { helpers }} = buidlerRuntime;
    if ( typeof helpers !== "object" ) {
        throw new Error("unexpected Buidler Runtime Environment");
    }
    helpers.registerActor = registerActor;
    helpers.setupDataRegistry = setupDataRegistry;

    await registerActor(buidlerRuntime,"ANNRegistry", "ANNActor");
    await registerActor(buidlerRuntime,"CECRegistry", "CECActor");
    await registerActor(buidlerRuntime,"CEGRegistry", "CEGActor");
    await registerActor(buidlerRuntime,"CERTFRegistry", "CERTFActor");
    await registerActor(buidlerRuntime,"PAMRegistry", "PAMActor");
    await registerActor(buidlerRuntime,"STKRegistry", "STKActor");

    await setupDataRegistry(buidlerRuntime);
}

/**
 * @param {import('./1-extend-buidler-env').ExtendedBRE} buidlerRuntime
 * @param {string} registry - Contract name
 * @param {string} actor  - address or Contract name
 */
async function registerActor(buidlerRuntime, registry, actor) {
    const {
        deployments: { log },
        usrNs: { roles: {deployer}, package: { contracts } },
        web3,
    } = buidlerRuntime;

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

/**
 * @param {import('./1-extend-buidler-env').ExtendedBRE} buidlerRuntime
 * @param {string} registry - Contract name
 * @param {string} actor  - address or Contract name
 */
async function setupDataRegistry(buidlerRuntime) {
    const {
        deployments: { log },
        usrNs: { roles: {deployer}, package: { contracts } },
        web3,
    } = buidlerRuntime;

    /** @type {import('./3-deploy-contracts').ContractsListDeployedItem[]} instances */
    const instances = contracts;
    const oracleContract = instances.find(i => i.name === 'OracleRegistry');
    if (!oracleContract) throw new Error("invalid oracle registry contract");

    const { deployment } = oracleContract;
    const oracleInstance = new web3.eth.Contract(deployment.abi, deployment.address);

    const dataRegistryProxy = instances.find(i => i.name === 'DataRegistryProxy');
    if (!dataRegistryProxy) throw new Error("invalid data registry proxy contract");
    const dataRegistryProxyInstance = new web3.eth.Contract(dataRegistryProxy.deployment.abi, dataRegistryProxy.deployment.address);

    const dataRegistry = instances.find(i => i.name === 'DataRegistry');
    if (!dataRegistry) throw new Error("invalid data registry contract");

    if (await oracleInstance.methods.dataRegistry().call() == dataRegistryProxy.deployment.address) {
        log(`DataRegistryProxy already registered in OracleRegistry`);
    } else {
        // TODO: make it idempotent - avoid re-sending pending transactions
        await oracleInstance.methods.setDataRegistry(dataRegistryProxy.deployment.address).send({
            from: deployer,
            gas: 100000,
        });
        log(`DataRegistryProxy has been registered in OracleRegistry`);
    }
    if (await dataRegistryProxyInstance.methods.dataRegistry().call() == dataRegistry.deployment.address) {
        log(`DataRegistryProxy already registered in OracleRegistry`);
    } else {
        // TODO: make it idempotent - avoid re-sending pending transactions
        await dataRegistryProxyInstance.methods.setDataRegistryAddress(dataRegistry.deployment.address).send({
            from: deployer,
            gas: 100000,
        });
        log(`DataRegistry has been set in DataRegistryProxy`);
    }
}
