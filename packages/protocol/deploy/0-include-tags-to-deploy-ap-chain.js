// Deploy contracts on the ap-chain
// NOTE: (unlike "migrate") it updates neither deployments nor artifacts
module.exports = async () => await Promise.resolve();
module.exports.tags = ["deploy-ap-chain"];
module.exports.dependencies = [
  "_env",
  "_package",
  "_deployment",
  "_init",
  "_export"
];

// run on the ap-chain only
module.exports.skip = ({ usrNs: { chainId }}) => Promise.resolve(chainId !== '1994');
