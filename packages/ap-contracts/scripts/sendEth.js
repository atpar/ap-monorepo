
module.exports = async (callback) => {
  const recipient = '0x2C390Ca49CeFb345330CFE86A518b7de85E577FA';
  const amount = web3.utils.toWei('10');

  console.log('Sending ETH to account ' + recipient + '.');

  const account = (await web3.eth.getAccounts())[0];

  try {
    await web3.eth.sendTransaction({
      from: account,
      to: recipient,
      value: amount
    });
  } catch (error) {
    console.log(error);
    callback(error);
  }

  console.log('Done.');

  callback();
}