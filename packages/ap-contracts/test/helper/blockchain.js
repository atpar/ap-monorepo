
async function createSnapshot () {
  new Promise((resolve, reject) =>  {
    web3.currentProvider.send({ 
      jsonrpc: '2.0', 
      method: 'evm_snapshot', 
      params: [], 
      id: new Date().getSeconds()
    }, async (err, res) => {
      if (err) { reject(err); }
      return resolve(res);
    });
  });
}

async function revertToSnapshot (snapshot) {
  return web3.currentProvider.send({
    jsonrpc: '2.0', 
    method: 'evm_revert', 
    params: [snapshot], 
    id: new Date().getSeconds()
  }, async (err) => {
    if (err) { throw(err); }
  });
}

async function mineBlock (blockTimestamp) {
  return web3.currentProvider.send({
    jsonrpc: '2.0', 
    method: 'evm_mine', 
    params: [blockTimestamp], 
    id: new Date().getSeconds()
  }, async (err) => {
    if (err) { throw(err); }
  });
}

async function getLatestBlockTimestamp () {
  return (await web3.eth.getBlock('latest')).timestamp.toString();
}

module.exports = { 
  createSnapshot,
  revertToSnapshot,
  mineBlock, 
  getLatestBlockTimestamp 
};
