module.exports = definePackage;
module.exports.tags = ["_package"];
module.exports.dependencies = ["_env"];

/**
 * @typedef {Object} DeployOptions - https://github.com/wighawag/hardhat-deploy#deploy-function
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
    { name: "COLLAEngine" },
    { name: "PAMEngine" },
    { name: "STKEngine" },

    // Asset Registry
    { name: "ANNEncoder", exportable: false },
    { name: "CECEncoder", exportable: false },
    { name: "CEGEncoder", exportable: false },
    { name: "CERTFEncoder", exportable: false },
    { name: "COLLAEncoder", exportable: false },
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
      name: "COLLARegistry",
      options: { libraries: { COLLAEncoder: "{{COLLAEncoder.address}}" }},
    },
    {
      name: "PAMRegistry",
      options: { libraries: { PAMEncoder: "{{PAMEncoder.address}}" }},
    },
    {
      name: "STKRegistry",
      options: { libraries: { STKEncoder: "{{STKEncoder.address}}" }},
    },

    // Data Registry Proxy
    { name: "DataRegistryProxy" },

    // Asset Actor
    {
      name: "ANNActor",
      options: { args: [ "{{ANNRegistry.address}}", "{{DataRegistryProxy.address}}" ]},
    },
    {
      name: "CECActor",
      options: { args: [ "{{CECRegistry.address}}", "{{DataRegistryProxy.address}}" ]},
    },
    {
      name: "CEGActor",
      options: { args: [ "{{CEGRegistry.address}}", "{{DataRegistryProxy.address}}" ]},
    },
    {
      name: "CERTFActor",
      options: { args: [ "{{CERTFRegistry.address}}", "{{DataRegistryProxy.address}}" ]},
    },
    {
      name: "COLLAActor",
      options: { args: [ "{{COLLARegistry.address}}", "{{DataRegistryProxy.address}}" ]},
    },
    {
      name: "PAMActor",
      options: { args: [ "{{PAMRegistry.address}}", "{{DataRegistryProxy.address}}" ]},
    },
    {
      name: "STKActor",
      options: { args: [ "{{STKRegistry.address}}", "{{DataRegistryProxy.address}}" ]},
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
    { name: "COLLACustodian", deployable: false },
    { name: "IExtension", deployable: false },
    { name: "IObserverOracleProxy", deployable: false },
    { name: "IPriceOracleProxy", deployable: false },
    { name: "ERC20", deployable: false },
    { name: "ERC1404", deployable: false },
    { name: "VanillaFDT", deployable: false },
    { name: "SimpleRestrictedFDT", deployable: false },
    { name: "ERC20Token", deployable: false },
    { name: "SettlementToken", deployable: false },
    { name: "NoSettlementToken", deployable: false }
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
