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
 * @property {boolean} [exportable] - `true` to export into `deployments.json` and `artifacts/` (default - `true`)
 * @property {boolean} [deployable] - if `false`, neither deploy nor export to `deployments.json` (default - `true`)
 *
 * @typedef {Object} Package
 * @property {ContractsListItem[]} contracts
 * @property {DeployOptions} defaultDeployOptions
 */

/** @param {ExtendedBRE} buidlerRuntime */
async function definePackage(buidlerRuntime) {

    const { deployments: { log }, usrNs } = buidlerRuntime;
    if ( typeof usrNs !== 'object' || typeof usrNs.package !== 'object' ) {
        throw new Error("unexpected Buidler Runtime Environment");
    }

    usrNs.package.contracts = [

        // ACTUS-Solidity
        { name: "ANNEngine" },
        { name: "CECEngine" },
        { name: "CEGEngine" },
        { name: "CERTFEngine" },
        { name: "PAMEngine" },
        { name: "STKEngine" },

        // Asset Registry
        { name: "ANNEncoder", exportable: false },
        { name: "CECEncoder", exportable: false },
        { name: "CEGEncoder", exportable: false },
        { name: "CERTFEncoder", exportable: false },
        { name: "PAMEncoder", exportable: false },
        { name: "STKEncoder", exportable: false },
        {
            name: "ANNRegistry",
            options: { libraries: { ANNEncoder: "{{ANNEncoder.address}}" }},
        },
        {
            name: "CECRegistry",
            options: { libraries: { CECEncoder: "{{CECEncoder.address}}" }},
        },
        {
            name: "CEGRegistry",
            options: { libraries: { CEGEncoder: "{{CEGEncoder.address}}" }},
        },
        {
            name: "CERTFRegistry",
            options: { libraries: { CERTFEncoder: "{{CERTFEncoder.address}}" }},
        },
        {
            name: "PAMRegistry",
            options: { libraries: { PAMEncoder: "{{PAMEncoder.address}}" }},
        },
        {
            name: "STKRegistry",
            options: { libraries: { STKEncoder: "{{STKEncoder.address}}" }},
        },

        // Data Registry
        { name: "DataRegistry" },
        { 
            name: "DataRegistryProxy",
            options: { args: [ "{{DataRegistry.address}}" ]},
        },
        // Data Registry
        { name: "OracleRegistry" },
        // Asset Actor
        {
            name: "ANNActor",
            options: { args: [ "{{ANNRegistry.address}}", "{{OracleRegistry.address}}" ]},
        },
        {
            name: "CECActor",
            options: { args: [ "{{CECRegistry.address}}", "{{OracleRegistry.address}}" ]},
        },
        {
            name: "CEGActor",
            options: { args: [ "{{CEGRegistry.address}}", "{{OracleRegistry.address}}" ]},
        },
        {
            name: "CERTFActor",
            options: { args: [ "{{CERTFRegistry.address}}", "{{OracleRegistry.address}}" ]},
        },
        {
            name: "PAMActor",
            options: { args: [ "{{PAMRegistry.address}}", "{{OracleRegistry.address}}" ]},
        },
        {
            name: "STKActor",
            options: { args: [ "{{STKRegistry.address}}", "{{OracleRegistry.address}}" ]},
        },

        // Custodian
        {
            name: "Custodian",
            options: { args: [ "{{CECActor.address}}", "{{CECRegistry.address}}" ]},
        },

        // DvPSettlement
        { name: "DvPSettlement" },

        // export artifacts only (do not deploy)
        { name: "BaseActor", deployable: false },
        { name: "BaseRegistry", deployable: false },
        { name: "ERC20", deployable: false },
        { name: "ERC1404", deployable: false },
        { name: "VanillaFDT", deployable: false },
        { name: "SimpleRestrictedFDT", deployable: false },
        { name: "SettlementToken", deployable: false },
        { name: "NoSettlementToken", deployable: false },
        { name: "ERC20Token", deployable: false }
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
