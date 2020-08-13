module.exports = definePackage;
module.exports.tags = ["_package"];
module.exports.dependencies = ["_env"];

/**
 * @typedef {import('./1-extend-buidler-env').UserBuidlerRuntimeEnvironment}
 * @param {UserBuidlerRuntimeEnvironment} bre
 */
async function definePackage(bre) {

    const { deployments: { log }, usrNs } = bre;
    if (typeof usrNs !== 'object' || typeof usrNs.package !== 'undefined') {
        throw new Error("unexpected BuidlerRuntimeEnvironment");
    }

    usrNs.package = {

        /**
         * @typedef {Object} DeployOptions - https://github.com/wighawag/buidler-deploy#deploy-function
         * @typedef {Object} ContractsListItem
         * @property {string} name - contract name
         * @property {DeployOptions} [options]
         * @property {function (UserBuidlerRuntimeEnvironment): DeployOptions} [getOptions] - getter for options
         * @property {boolean} [exportDeployment] - `true` to record in `../deployments.json`
         */

        /** @property {ContractsListItem[]} contracts - list of contracts to be deployed */
        contracts: [

            // ACTUS-Solidity
            { name: "ANNEngine", exportDeployment: true },
            { name: "CECEngine", exportDeployment: true },
            { name: "CEGEngine", exportDeployment: true },
            { name: "CERTFEngine", exportDeployment: true },
            { name: "PAMEngine", exportDeployment: true },

            // Asset Registry
            { name: "ANNEncoder" },
            { name: "CECEncoder" },
            { name: "CEGEncoder" },
            { name: "CERTFEncoder" },
            { name: "PAMEncoder" },
            {
                name: "ANNRegistry",
                exportDeployment: true,
                getOptions: ({ usrNs: { instances: { ANNEncoderInstance }}}) =>
                        ({ libraries: { ANNEncoder: ANNEncoderInstance.options.address }}),
            },
            {
                name: "CECRegistry",
                exportDeployment: true,
                getOptions: ({usrNs: {instances: {CECEncoderInstance}}}) =>
                        ({ libraries: {CECEncoder: CECEncoderInstance.options.address }}),
            },
            {
                name: "CEGRegistry",
                exportDeployment: true,
                getOptions: ({ usrNs: { instances: { CEGEncoderInstance }}}) =>
                        ({ libraries: { CEGEncoder: CEGEncoderInstance.options.address }}),
            },
            {
                name: "CERTFRegistry",
                exportDeployment: true,
                getOptions: ({ usrNs: { instances: { CERTFEncoderInstance }}}) =>
                        ({ libraries: { CERTFEncoder: CERTFEncoderInstance.options.address }}),
            },
            {
                name: "PAMRegistry",
                exportDeployment: true,
                getOptions: ({ usrNs: { instances: { PAMEncoderInstance }}}) =>
                        ({ libraries: { PAMEncoder: PAMEncoderInstance.options.address }}),
            },

            // Data Registry
            { name: "DataRegistry", exportDeployment: true },

            // Asset Actor
            {
                name: "ANNActor",
                exportDeployment: true,
                getOptions: ({ usrNs: { instances: { ANNRegistryInstance, DataRegistryInstance }}}) =>
                        ({ args: [ ANNRegistryInstance.options.address, DataRegistryInstance.options.address ]}),
            },
            {
                name: "CECActor",
                exportDeployment: true,
                getOptions: ({ usrNs: { instances: { CECRegistryInstance, DataRegistryInstance }}}) =>
                        ({ args: [ CECRegistryInstance.options.address, DataRegistryInstance.options.address ]}),
            },
            {
                name: "CEGActor",
                exportDeployment: true,
                getOptions: ({ usrNs: { instances: { CEGRegistryInstance, DataRegistryInstance }}}) =>
                        ({ args: [ CEGRegistryInstance.options.address, DataRegistryInstance.options.address ]}),
            },
            {
                name: "CERTFActor",
                exportDeployment: true,
                getOptions: ({ usrNs: { instances: {CERTFRegistryInstance, DataRegistryInstance }}}) =>
                        ({ args: [ CERTFRegistryInstance.options.address, DataRegistryInstance.options.address ]}),
            },
            {
                name: "PAMActor",
                exportDeployment: true,
                getOptions: ({ usrNs: { instances: { PAMRegistryInstance, DataRegistryInstance }}}) =>
                        ({ args: [ PAMRegistryInstance.options.address, DataRegistryInstance.options.address ]}),
            },

            // Custodian
            {
                name: "Custodian",
                exportDeployment: true,
                getOptions: ({ usrNs: { instances: {CECActorInstance, CECRegistryInstance }}}) =>
                        ({ args: [ CECActorInstance.options.address, CECRegistryInstance.options.address ]}),
            },

            // FDT
            { name: "ProxySafeVanillaFDT" },
            { name: "ProxySafeSimpleRestrictedFDT" },
            {
                name: "FDTFactory",
                exportDeployment: true,
                getOptions:
                    ({ usrNs: { instances: {ProxySafeVanillaFDTInstance, ProxySafeSimpleRestrictedFDTInstance }}}) =>
                        ({
                            libraries: {
                                VanillaFDTLogic: ProxySafeVanillaFDTInstance.options.address,
                                SimpleRestrictedFDTLogic: ProxySafeSimpleRestrictedFDTInstance.options.address,
                            },
                        }),
            },

            // ICT
            { name: "ProxySafeICT" },
            {
                name: "ICTFactory",
                getOptions: ({ usrNs: { instances: {ProxySafeICTInstance }}}) =>
                        ({ libraries: { ICTLogic: ProxySafeICTInstance.options.address }}),
            },

            // DvPSettlement
            { name: "DvPSettlement", exportDeployment: true },

            // settlement token (for templates on testnets)
            { name: "SettlementToken" },
        ],

        /** @property {DeployOptions} */
        defaultDeployOptions: {
            from: usrNs.roles.deployer,
            gas: 4500000,
            log: true,
        },
    };

    log(`package contracts: ${usrNs.package.contracts.map(e => e.name)}`);

    // shall be async
    return Promise.resolve();
}
