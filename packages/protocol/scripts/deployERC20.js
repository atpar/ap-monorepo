const ERC20Token = require('../build/contracts/ERC20Token.json');

(async () => {
  const name = 'Test CHF';
  const symbol = 'TCHF';
  const account = (await web3.eth.getAccounts())[0];
  let erc20 = new web3.eth.Contract(ERC20Token.abi);
  erc20 = await erc20.deploy({ data: ERC20Token.bytecode, arguments: [name, symbol] }).send({ from: account });
  await erc20.methods.drip(account, 100).send({ from: account });
  console.log(erc20.options.address);
})();
