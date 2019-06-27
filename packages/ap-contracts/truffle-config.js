const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    goerli: {
      provider: () =>
        new HDWalletProvider(require('./mnemonic.js'), 'https://goerli.infura.io/v3/16b0bb612ec14abeb3617cff126ea5c0'),
      network_id: '5' 
    },
    kovan: {
      provider: () =>
        new HDWalletProvider(require('./mnemonic.js'), 'https://kovan.infura.io/v3/16b0bb612ec14abeb3617cff126ea5c0'),
      network_id: '42'
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(require('./mnemonic.js'), 'https://rinkeby.infura.io/v3/16b0bb612ec14abeb3617cff126ea5c0'),
      network_id: '4'
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider(require('./mnemonic.js'), 'https://ropsten.infura.io/v3/16b0bb612ec14abeb3617cff126ea5c0'),
      network_id: '3'
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
};
