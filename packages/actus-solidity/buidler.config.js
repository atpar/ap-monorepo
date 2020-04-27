usePlugin('@nomiclabs/buidler-truffle5');
usePlugin('@nomiclabs/buidler-web3');
usePlugin('solidity-coverage');


module.exports = {
  paths: {
    artifacts: './test/artifacts'
  },
  defaultNetwork: 'buidlerevm',
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545'
    },
    buidlerevm: {
      allowUnlimitedContractSize: true
    }
  },
  solc: {
    version: '0.6.4',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
