module.exports = initContractsForTests;
module.exports.tags = ["_init-tests"];
module.exports.dependencies = ["_env-tests", "_deployment"];

// never run on the mainnet
module.exports.skip = ({ usrNs: { chainId }}) => Promise.resolve(parseInt(chainId) < 2);

/** @param {import('./1-extend-buidler-env').ExtendedBRE} bre */
async function initContractsForTests(bre) {

    const { usrNs: { roles: { admin, defaultActor }, helpers: { registerActor } }} = bre;
    if ( !admin || !defaultActor || typeof registerActor !== "function" ) {
        throw new Error("unexpected Buidler Runtime Environment");
    }

    await registerActor(bre, "ANNRegistry", admin);
    await registerActor(bre, "CECRegistry", admin);
    await registerActor(bre, "CEGRegistry", admin);
    await registerActor(bre, "CERTFRegistry", admin);
    await registerActor(bre, "PAMRegistry", admin);

    await registerActor(bre, "ANNRegistry", defaultActor);
    await registerActor(bre, "CECRegistry", defaultActor);
    await registerActor(bre, "CEGRegistry", defaultActor);
    await registerActor(bre, "CERTFRegistry", defaultActor);
    await registerActor(bre, "PAMRegistry", defaultActor);
}
