// Starting from v.10.20, node.js supports "--unhandled-rejections=strict" option
// This script adds similar behaviour for earlier versions

/**
 * @typedef {import('./1-extend-buidler-env').BuidlerRuntimeEnvironment}
 * @param {BuidlerRuntimeEnvironment} buidlerRuntime
 */
module.exports = async (buidlerRuntime) => {
  const { deployments: { log }} = buidlerRuntime;

  process.on('unhandledRejection', (err) => {
    console.error(`${err}`);
    console.error('An unhandledRejection occurred. Terminating...');
    process.exit(128);
  });

  log('--unhandled-rejections=strict emulated');

  await Promise.resolve();
}

module.exports.tags = ["_terminate-on-rejections"];
