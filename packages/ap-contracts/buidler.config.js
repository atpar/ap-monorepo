usePlugin('@nomiclabs/buidler-truffle5');
usePlugin('@nomiclabs/buidler-web3');
// usePlugin("buidler-gas-reporter");
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
      allowUnlimitedContractSize: true,
      initialDate: '2009-01-03T18:15:05' // for ACTUS test cases
    }
  },
  solc: {
    version: '0.6.4',
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
