// Deploy contracts and update deployments.js
module.exports = async () => await Promise.resolve();
module.exports.tags = ["migrate"];
module.exports.dependencies = [
    "_env",             // extend buidler runtime environment
    "_package",         // define contracts to deploy
    "_balance",         // assert deployer balance
    "_deployment",      // deploy contracts
    "_init",            // init contracts
    "_export",          // update '../deployments.js'
    "_verification",    // do contract verification
];
