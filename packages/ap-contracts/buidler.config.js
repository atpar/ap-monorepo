const { TASK_COMPILE_GET_COMPILER_INPUT } = require('@nomiclabs/buidler/builtin-tasks/task-names');


// usePlugin('@nomiclabs/buidler-truffle5');
usePlugin('@nomiclabs/buidler-web3');
usePlugin('solidity-coverage');
usePlugin("buidler-deploy");
// usePlugin('buidler-gas-reporter');

task(TASK_COMPILE_GET_COMPILER_INPUT).setAction(async (_, __, runSuper) => {
  const input = await runSuper();
  input.settings.metadata.useLiteralContent = false;
  return input;
});

module.exports = {
  paths: {
    artifacts: './test/artifacts',
    deployments: 'deployments',
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
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: (process.env.PRIV_KEYS || '').split('.')
    }
  },
  // https://github.com/wighawag/buidler-deploy#namedaccounts
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
    admin: {
      default: 1,
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
