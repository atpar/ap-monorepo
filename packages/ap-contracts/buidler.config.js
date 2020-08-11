const { TASK_COMPILE_GET_COMPILER_INPUT } = require('@nomiclabs/buidler/builtin-tasks/task-names');


usePlugin('@nomiclabs/buidler-truffle5');
usePlugin('@nomiclabs/buidler-web3');
usePlugin('solidity-coverage');
// usePlugin('buidler-gas-reporter');

task(TASK_COMPILE_GET_COMPILER_INPUT).setAction(async (_, __, runSuper) => {
  const input = await runSuper();
  input.settings.metadata.useLiteralContent = false;
  return input;
});

function getMnemonic() {
  try {
    return require('./mnemonic.js');
  } catch (error) {
    return '';
  }
}

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
      allowUnlimitedContractSize: false,
      initialDate: '2009-01-03T18:15:05' // for ACTUS test cases
    },
    'ap-chain': {
      url: 'http://127.0.0.1:8545'
    },
    goerli: {
      url: 'https://goerli.infura.io/v3/16b0bb612ec14abeb3617cff126ea5c0',
      accounts: {
        mnemonic: getMnemonic(),
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 5
      }
    },
    kovan: {
      url: 'https://kovan.infura.io/v3/16b0bb612ec14abeb3617cff126ea5c0',
      accounts: {
        mnemonic: getMnemonic(),
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 5
      }
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/16b0bb612ec14abeb3617cff126ea5c0',
      accounts: {
        mnemonic: getMnemonic(),
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 5
      }
    },
    ropsten: {
      url: 'https://ropsten.infura.io/v3/16b0bb612ec14abeb3617cff126ea5c0',
      accounts: {
        mnemonic: getMnemonic(),
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 5
      }
    }
  },
  solc: {
    version: '0.6.11',
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  // gasReporter: {}
};
