module.exports = definePackage;
module.exports.tags = ["_package"];
module.exports.dependencies = ["_env"];

/**
 * @typedef {Object} DeployOptions - https://github.com/wighawag/buidler-deploy#deploy-function
 * @typedef {import('./1-extend-buidler-env').ExtendedBRE}
 *
 * @typedef {Object} ContractsListItem
 * @property {string} name - contract name
 * @property {DeployOptions} [options]
 * @property {function (ExtendedBRE): DeployOptions} [getOptions] - getter for options
 * @property {boolean} [exportDeployment] - `true` to export into `../deployments.json` and `../artifacts/`
 *
 * @typedef {Object} Package
 * @property {ContractsListItem[]} contracts
 * @property {DeployOptions} defaultDeployOptions
 */

/** @param {ExtendedBRE} bre */
async function definePackage(bre) {

    const { deployments: { log }, usrNs } = bre;
    if ( typeof usrNs !== 'object' || typeof usrNs.package !== 'object' ) {
        throw new Error("unexpected Buidler Runtime Environment");
    }

    usrNs.package.contracts = [

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
            options: { libraries: { ANNEncoder: "{{ANNEncoder.address}}" }},
        },
        {
            name: "CECRegistry",
            exportDeployment: true,
            options: { libraries: { CECEncoder: "{{CECEncoder.address}}" }},
        },
        {
            name: "CEGRegistry",
            exportDeployment: true,
            options: { libraries: { CEGEncoder: "{{CEGEncoder.address}}" }},
        },
        {
            name: "CERTFRegistry",
            exportDeployment: true,
            options: { libraries: { CERTFEncoder: "{{CERTFEncoder.address}}" }},
        },
        {
            name: "PAMRegistry",
            exportDeployment: true,
            options: { libraries: { PAMEncoder: "{{PAMEncoder.address}}" }},
        },

        // Data Registry
        { name: "DataRegistry", exportDeployment: true },

        // Asset Actor
        {
            name: "ANNActor",
            exportDeployment: true,
            options: { args: [ "{{ANNRegistry.address}}", "{{DataRegistry.address}}" ]},
        },
        {
            name: "CECActor",
            exportDeployment: true,
            options: { args: [ "{{CECRegistry.address}}", "{{DataRegistry.address}}" ]},
        },
        {
            name: "CEGActor",
            exportDeployment: true,
            options: { args: [ "{{CEGRegistry.address}}", "{{DataRegistry.address}}" ]},
        },
        {
            name: "CERTFActor",
            exportDeployment: true,
            options: { args: [ "{{CERTFRegistry.address}}", "{{DataRegistry.address}}" ]},
        },
        {
            name: "PAMActor",
            exportDeployment: true,
            options: { args: [ "{{PAMRegistry.address}}", "{{DataRegistry.address}}" ]},
        },

        // Custodian
        {
            name: "Custodian",
            exportDeployment: true,
            options: { args: [ "{{CECActor.address}}", "{{CECRegistry.address}}" ]},
        },

        // FDT
        { name: "ProxySafeVanillaFDT" },
        { name: "ProxySafeSimpleRestrictedFDT" },
        {
            name: "FDTFactory",
            exportDeployment: true,
            options: { libraries: {
                    VanillaFDTLogic: "{{ProxySafeVanillaFDT.address}}",
                    SimpleRestrictedFDTLogic: "{{ProxySafeSimpleRestrictedFDT.address}}",
                }},
        },

        // ICT
        { name: "ProxySafeICT" },
        {
            name: "ICTFactory",
            options: { libraries: { ICTLogic: "{{ProxySafeICT.address}}" }},
        },

        // DvPSettlement
        { name: "DvPSettlement", exportDeployment: true },

        // settlement token (for templates on testnets)
        { name: "SettlementToken" },
    ];

    usrNs.package.defaultDeployOptions = {
        from: usrNs.roles.deployer,
        gas: 4500000,
        log: true,
    };

    log(`${usrNs.package.contracts.length} contracts defined`);

    // shall be async
    return Promise.resolve();
}
