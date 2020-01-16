const HDWalletProvider = require("truffle-hdwallet-provider");


module.exports = {

  plugins: ["truffle-security", "solidity-coverage"],

  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    goerli: {
      provider: () =>
        new HDWalletProvider(require('./mnemonic.js'), 'https://goerli.infura.io/v3/a5d418a8a94240fa8d067ed1ac2313fa'),
      network_id: '5',
      skipDryRun: true
    },
    kovan: {
      provider: () =>
        new HDWalletProvider(require('./mnemonic.js'), 'https://kovan.infura.io/v3/a5d418a8a94240fa8d067ed1ac2313fa'),
      network_id: '42',
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(require('./mnemonic.js'), 'https://rinkeby.infura.io/v3/a5d418a8a94240fa8d067ed1ac2313fa'),
      network_id: '4',
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider(require('./mnemonic.js'), 'https://ropsten.infura.io/v3/a5d418a8a94240fa8d067ed1ac2313fa'),
      network_id: '3',
    },
  },
  compilers: {
    solc: {
      version: "0.5.2",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
}
