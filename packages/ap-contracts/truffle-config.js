module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    }
  },
  compilers: {
    solc: {
      version: "0.5.2", // 0.4.25
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
}
