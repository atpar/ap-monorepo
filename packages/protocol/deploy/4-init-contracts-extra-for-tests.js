module.exports = initContractsForTests;
module.exports.tags = ["_init-tests"];
module.exports.dependencies = ["_env-tests", "_deployment"];

// never run on the mainnet
module.exports.skip = ({ usrNs: { chainId }}) => Promise.resolve(parseInt(chainId) < 2);

/** @param {import('./1-extend-buidler-env').ExtendedBRE} buidlerRuntime */
async function initContractsForTests(buidlerRuntime) {

    const { usrNs: { roles: { admin, defaultActor }, helpers: { registerActor } }} = buidlerRuntime;
    if ( !admin || !defaultActor || typeof registerActor !== "function" ) {
        throw new Error("unexpected Buidler Runtime Environment");
    }

    await registerActor(buidlerRuntime, "ANNRegistry", admin);
    await registerActor(buidlerRuntime, "CECRegistry", admin);
    await registerActor(buidlerRuntime, "CEGRegistry", admin);
    await registerActor(buidlerRuntime, "CERTFRegistry", admin);
    await registerActor(buidlerRuntime, "PAMRegistry", admin);
    await registerActor(buidlerRuntime, "STKRegistry", admin);

    await registerActor(buidlerRuntime, "ANNRegistry", defaultActor);
    await registerActor(buidlerRuntime, "CECRegistry", defaultActor);
    await registerActor(buidlerRuntime, "CEGRegistry", defaultActor);
    await registerActor(buidlerRuntime, "CERTFRegistry", defaultActor);
    await registerActor(buidlerRuntime, "PAMRegistry", defaultActor);
    await registerActor(buidlerRuntime, "STKRegistry", defaultActor);
}
