// Generate artifacts
module.exports = async () => await Promise.resolve();
module.exports.tags = ["artifacts"];
module.exports.dependencies = [
    "_env",
    "_package",
    "_deployment",      // deployments needed just to get metadata
    "_artifacts",       // generate '../artifacts/*.min.json' files
];

// run on the buidlerEVM network only
module.exports.skip = ({ usrNs: { chainId }}) => Promise.resolve(`${chainId}` !== '31337' );
