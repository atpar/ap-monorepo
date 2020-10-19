const SimpleRestrictedRuleEngine = require('./build/contracts/SimpleRestrictedRuleEngine.json');

(async () => {
  const account = (await web3.eth.getAccounts())[0];
  const admin = '0x4880Fdd12855C012F35f97A4109219108C06da0D';
  let ruleEngine = new web3.eth.Contract(SimpleRestrictedRuleEngine.abi);
  ruleEngine = await ruleEngine.deploy({ data: SimpleRestrictedRuleEngine.bytecode, arguments: [account] }).send({ from: account });
  ruleEngine.methods.addAdmin(admin).send({ from: account });
  console.log(ruleEngine.options.address);
})();
