const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {

  networks: { 
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    'ap-chain': {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 8000000
    },
    goerli: {
      provider: () =>
        new HDWalletProvider(require('./mnemonic.js'), 'https://goerli.infura.io/v3/16b0bb612ec14abeb3617cff126ea5c0'),
      network_id: '5',
      skipDryRun: true
    },
    kovan: {
      provider: () =>
        new HDWalletProvider(require('./mnemonic.js'), 'https://kovan.infura.io/v3/16b0bb612ec14abeb3617cff126ea5c0'),
      network_id: '42',
      skipDryRun: true
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(require('./mnemonic.js'), 'https://rinkeby.infura.io/v3/16b0bb612ec14abeb3617cff126ea5c0'),
      network_id: '4',
      skipDryRun: true
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider(require('./mnemonic.js'), 'https://ropsten.infura.io/v3/16b0bb612ec14abeb3617cff126ea5c0'),
      network_id: '3',
      skipDryRun: true
    },
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions : {
      currency: 'USD',
      excludeContracts: ['Migrations']
    }
  },
  compilers: {
    solc: {
      version: "0.6.10",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
