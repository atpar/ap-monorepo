/*jslint node*/
/*global before, beforeEach, describe, it*/
const assert = require('assert');
const bre = require('@nomiclabs/buidler');
const { BN } = require('openzeppelin-test-helpers');

const { ZERO_ADDRESS } = require('../helper/utils');
const { setupTestEnvironment, deployPaymentToken } = require('../helper/setupTestEnvironment');
const {
  buildCreate2Eip1167ProxyAddress: buildProxyAddr,
  getEip1167ProxyLogicAddress: extractLogicAddr,
} = require('../helper/proxy/create2.js')(web3);

describe('FDTFactory', () => {
  const txOpts = {};
  let creator, owner, owner2, tokenHolder1, anyone;

  // (sets of) Parameters to create FDTokens with
  const fdtParams = [
    // Valid params
    { name: 'test_FDT1', symbol: 'FDT1', totalSupply: '1000000', owner: () => owner, salt: 0xbadC0FEbebebe },
    { name: 'test_FDT2', symbol: 'FDT2', totalSupply: '3000000', owner: () => owner2, salt: 8954 },
    // Invalid params
    { name: 'non-unique_salt', symbol: 'FTD3', totalSupply: '2000000', owner: () => owner2, salt: 8954 },
    { name: 'invalid_funds-token', symbol: 'FTD4', totalSupply: '4000000', owner: () => owner2, salt: 0xDEAD, fundsToken: ZERO_ADDRESS},
  ];

  before(async () => {
    await setupTestEnvironment(bre);
    [ creator, owner, owner2, tokenHolder1, anyone ] = bre.usrNs.accounts;
    txOpts.from = creator;

    this.instances =  await setupTestEnvironment(bre);
    this.fundsToken = await deployPaymentToken(
        owner,
        [owner2, tokenHolder1, anyone],
        this.instances.SettlementTokenInstance,
    );

    fdtParams.forEach((e) => {
      if (typeof e.owner === 'function') e.owner = e.owner();
      if (!e.fundsToken) e.fundsToken = this.fundsToken.options.address;
    });

    // expected values
    this.exp = {
      logicAbi: {
        ProxySafeVanillaFDT: this.instances.ProxySafeVanillaFDTInstance.options.jsonInterface,
        ProxySafeSimpleRestrictedFDT: this.instances.ProxySafeSimpleRestrictedFDTInstance.options.jsonInterface,
      },
      logicAddr: {
        ProxySafeVanillaFDT: this.instances.ProxySafeVanillaFDTInstance.options.address,
        ProxySafeSimpleRestrictedFDT: this.instances.ProxySafeSimpleRestrictedFDTInstance.options.address,
      },
      deployingAddr: this.instances.FDTFactoryInstance.options.address,
      salt: [ fdtParams[0].salt, fdtParams[1].salt ],
    };
  });

  describe('createERC20Distributor(...)', async () => {
    before(async() => {
      await invokeCreateFdtFunction.bind(this)('createERC20Distributor', 'ProxySafeVanillaFDT')
    });
    assertInvocationResults.bind(this)('ProxySafeVanillaFDT');
  });

  describe('createRestrictedERC20Distributor(...)', async () => {
    before(async() => {
      await invokeCreateFdtFunction.bind(this)('createRestrictedERC20Distributor', 'ProxySafeSimpleRestrictedFDT')
    });
    assertInvocationResults.bind(this)('ProxySafeSimpleRestrictedFDT');
  });

  function assertInvocationResults(logicContract) {

    describe('Following the "proxy-implementation" pattern', () => {

      it(`should deploy a new proxy`, () => {
        assert(this.act[0].proxyBytecode.length > 0);
        assert(this.act[1].proxyBytecode.length > 0);
      });

      describe('The new proxy deployed', () => {
        it('should be the EIP-1167 proxy', () => {
          assert(web3.utils.isAddress(extractLogicAddr(this.act[0].proxyBytecode)));
          assert(web3.utils.isAddress(extractLogicAddr(this.act[1].proxyBytecode)));
        });
      });

      describe('Being a `delegatecall`', () => {

        it(`should be forwarded to a pre-deployed ${logicContract}`, () => {
          assert.strictEqual(extractLogicAddr(this.act[0].proxyBytecode), this.exp.logicAddr[logicContract]);
          assert.strictEqual(extractLogicAddr(this.act[1].proxyBytecode), this.exp.logicAddr[logicContract]);
        });

        it('should write to the storage of the proxy', () => {
          assert.strictEqual(this.act[0].fdToken.symbol, fdtParams[0].symbol);
          assert.strictEqual(this.act[1].fdToken.symbol, fdtParams[1].symbol);
        });

        it(`should not write to the pre-deployed ${logicContract} storage`, () => {
          assert.strictEqual(this.act.logicStorage.symbol, '');
          assert.strictEqual(this.act.logicStorage.name, '');
          assert.strictEqual(this.act.logicStorage.totalSupply, '0');
        });

      });
    });

    describe('Applying `CREATE2` to deploy a proxy', () => {

      describe('For a salt given', () => {
        it('should deploy a new proxy instance at a pre-defined address', () => {
          assert.strictEqual(this.act[0].proxy, buildProxyAddr(
              this.exp.deployingAddr,
              this.exp.salt[0],
              this.exp.logicAddr[logicContract]
          ));
          assert.strictEqual(this.act[1].proxy, buildProxyAddr(
              this.exp.deployingAddr,
              this.exp.salt[1],
              this.exp.logicAddr[logicContract]
          ));
        });
      });

      describe('If the salt was already used to deploy another proxy', () => {
        it('reverts', () => {
          assert(this.act[2].message.toLowerCase().includes('revert'));
        });
      });
    });

    describe('When called with valid params', () => {

      it(`should instantiate a new ${logicContract} instance`, () => {
        ([fdtParams[0], fdtParams[1]]).map((expected, i) => {
          const actual = this.act[i].fdToken;
          ['name', 'symbol', 'totalSupply', 'owner'].forEach(
              key => assert.strictEqual(actual[key], expected[key], `${key} (${i})`),
          )
        });
      });

      describe('With the NewEip1167Proxy event emitted', () => {
        it('should provide the new proxy address', () => {
          assert(web3.utils.isAddress(this.act[0].proxy));
          assert(web3.utils.isAddress(this.act[1].proxy));
        });
        it(`should provide the pre-deployed ${logicContract} address`, () => {
          assert.strictEqual(this.act[0].logic, this.exp.logicAddr[logicContract]);
          assert.strictEqual(this.act[1].logic, this.exp.logicAddr[logicContract]);
        });
        it('should provide the CREATE2 salt', () => {
          assert.strictEqual(this.act[0].salt, (new BN(this.exp.salt[0])).toString());
          assert.strictEqual(this.act[1].salt, (new BN(this.exp.salt[1])).toString());
        });
      });

      describe('With the DeployedDistributor event emitted', () => {
        it(`should provide the new instantiated ${logicContract} address`, async () => {
          assert(web3.utils.isAddress(this.act[0].distributor));
          assert(web3.utils.isAddress(this.act[1].distributor));
        });
        it('should provide the creator address', () => {
          assert.strictEqual(this.act[0].creator, creator);
          assert.strictEqual(this.act[1].creator, creator);
        });
      });

    });

    describe('When called with zero address of the funds token', () => {
      it('reverts', () => {
        assert(this.act[3].message.toLowerCase().includes('revert'));
      });
    });

    describe(`New ${logicContract} instance instantiated`, () => {
      it('should have the address of the proxy', () => {
        assert.strictEqual(this.act[0].distributor, this.act[0].proxy);
        assert.strictEqual(this.act[1].distributor, this.act[1].proxy);
      });
    });
  }

  async function invokeCreateFdtFunction(fnName, logicContract) {
    const self = this;
    // actual values
    this.act = [];

    // deploy FDTokens calling `fnName` for every `fdtParams[i]`
    for (let i = 0; i < fdtParams.length; i++) {
      const {name, symbol, totalSupply, owner, fundsToken, salt} = fdtParams[i];
      try {
        const tx = await self.instances.FDTFactoryInstance
            .methods[fnName](name, symbol, totalSupply, fundsToken, owner, salt)
            .send(txOpts);
        const actual = decodeEvents(tx);
        actual.proxyBytecode = await web3.eth.getCode(actual.proxy);
        actual.fdToken = await readTokenStorage(
            new web3.eth.Contract(this.exp.logicAbi[logicContract], actual.proxy)
        );
        this.act.push(actual);
      }
          // values may be intentionally invalid
      catch (error) {
        this.act.push(error);
      }
    }
    this.act.logicStorage = await readTokenStorage(
        new web3.eth.Contract(this.exp.logicAbi[logicContract], this.exp.logicAddr[logicContract])
    );
  }

  function decodeEvents(tx) {
    const {returnValues: { proxy, logic, salt: saltBN }, address: proxyFactory} = tx.events.NewEip1167Proxy;
    const { distributor, creator } = tx.events.DeployedDistributor.returnValues;
    const salt = saltBN.toString();
    return { proxy, logic, salt, distributor, creator, proxyFactory };
  }

  async function readTokenStorage(contract) {
    return Promise.all([
      contract.methods.name().call(),
      contract.methods.symbol().call(),
      contract.methods.totalSupply().call().then(n => n.toString()),
      contract.methods.owner().call(),
    ]).then(([ name, symbol, totalSupply, owner ]) => ({ name, symbol, totalSupply, owner }));
  }
});
