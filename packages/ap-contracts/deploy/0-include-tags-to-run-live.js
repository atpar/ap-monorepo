// does nothing except for tags (and dependencies) declaration
module.exports = async () => await Promise.resolve();
module.exports.tags = ["live"]
module.exports.dependencies = ["_env", "_package", "_deployment", "_init", "_export"];
