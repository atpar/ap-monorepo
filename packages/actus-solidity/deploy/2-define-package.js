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
            { name: "ANNEngine" },
            { name: "CECEngine" },
            { name: "CEGEngine" },
            { name: "CERTFEngine" },
            { name: "PAMEngine" },

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
