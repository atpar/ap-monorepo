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
