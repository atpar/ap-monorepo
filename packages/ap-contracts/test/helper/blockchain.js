
async function createSnapshot () {
  return new Promise((resolve, reject) =>  {
    web3.currentProvider.send({ 
      jsonrpc: '2.0', 
      method: 'evm_snapshot', 
      params: [], 
      id: new Date().getSeconds()
    }, async (err, res) => {
      // console.log('res: ' + JSON.stringify(res), 'error: ' + JSON.stringify(err));
      if (err) { reject(err); }
      return resolve(res.result);
    });
  });
}

async function revertToSnapshot (snapshot) {
  return new Promise((resolve, reject) =>  {
    web3.currentProvider.send({ 
      jsonrpc: '2.0', 
      method: 'evm_revert', 
      params: [snapshot], 
      id: new Date().getSeconds()
    }, async (err, res) => {
      // console.log('res: ' + JSON.stringify(res), 'error: ' + JSON.stringify(err));
      if (err) { reject(err); }
      return resolve(res);
    });
  });
}

async function mineBlock (blockTimestamp) {
  return new Promise((resolve, reject) =>  {
    web3.currentProvider.send({ 
      jsonrpc: '2.0', 
      method: 'evm_mine', 
      params: [blockTimestamp], 
      id: new Date().getSeconds()
    }, async (err, res) => {
      // console.log('res: ' + JSON.stringify(res), 'error: ' + JSON.stringify(err));
      if (err) { reject(err); }
      return resolve(res);
    });
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
