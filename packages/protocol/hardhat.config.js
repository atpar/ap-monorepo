const { TASK_COMPILE_GET_COMPILER_INPUT } = require('hardhat/builtin-tasks/task-names');

require('@nomiclabs/hardhat-web3');
// require('solidity-coverage');
require("hardhat-deploy");
require('hardhat-gas-reporter');
require("hardhat-typechain");


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
    artifacts: './build/contracts',
    deployments: 'deployments',
  },
  defaultNetwork: 'hardhat',
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545'
    },
    hardhat: {
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
  namedAccounts: {
    deployer: {
      default: 0, // the first account
    },
    admin: {
      default: 1,
    }
  },
  solidity: {
    version: '0.7.4',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  gasReporter: {
    currency: 'CHF',
    gasPrice: 90
  },
  typechain: {
    outDir: "src/types/contracts",
    target: "web3-v1",
  }
};
