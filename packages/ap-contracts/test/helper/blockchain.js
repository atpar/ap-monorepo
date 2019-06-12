
async function mineBlock (blockTimestamp) {
  return web3.currentProvider.send({
    jsonrpc: '2.0', 
    method: 'evm_mine', 
    params: [blockTimestamp], 
    id: new Date().getSeconds()
  }, async (err, res) => {
    if (err) { throw(err); }
  });
}

async function getLatestBlockTimestamp () {
  return (await web3.eth.getBlock('latest')).timestamp.toString();
}

module.exports = { mineBlock, getLatestBlockTimestamp };
