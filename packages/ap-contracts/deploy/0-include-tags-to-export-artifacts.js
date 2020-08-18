// declares tags (dependencies) only
module.exports = async () => await Promise.resolve();
module.exports.tags = ["artifacts"]
module.exports.dependencies = [
    "_env",
    "_package",
    "_artifacts",
];
