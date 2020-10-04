const { TASK_COMPILE_GET_COMPILER_INPUT } = require('@nomiclabs/buidler/builtin-tasks/task-names');


usePlugin('@nomiclabs/buidler-truffle5');
usePlugin('@nomiclabs/buidler-web3');
usePlugin('solidity-coverage');

task(TASK_COMPILE_GET_COMPILER_INPUT).setAction(async (_, __, runSuper) => {
  const input = await runSuper();
  input.settings.metadata.useLiteralContent = false;
  return input;
});

module.exports = {
  paths: {
    artifacts: './build/contracts'
  },
  defaultNetwork: 'buidlerevm',
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545'
    },
    buidlerevm: {
      allowUnlimitedContractSize: false
    }
  },
  solc: {
    version: '0.6.11',
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
