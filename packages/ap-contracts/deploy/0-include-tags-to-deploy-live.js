// declares tags (dependencies) only
module.exports = async () => await Promise.resolve();
module.exports.tags = ["live"]
module.exports.dependencies = [
    "_env",
    "_package",
    "_deployment",
    "_init",
    "_export",
    "_artifacts",
    "_verification",
];
