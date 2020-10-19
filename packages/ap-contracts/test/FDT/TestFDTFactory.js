/*jslint node*/
/*global before, beforeEach, describe, it, web3*/
const assert = require('assert');
const buidlerRuntime = require('@nomiclabs/buidler');
const { BN } = require('openzeppelin-test-helpers');

const { ZERO_ADDRESS } = require('../helper/utils/utils');
const { getSnapshotTaker, deployPaymentToken } = require('../helper/setupTestEnvironment');
const {
  buildCreate2Eip1167ProxyAddress: buildProxyAddr,
  getEip1167ProxyLogicAddress: extractLogicAddr,
} = require('../helper/utils/create2.js')(web3);


describe('FDTFactory', () => {
  let creator, owner, owner2, tokenHolder, tokenHolder2;

  // (sets of) Parameters to create FDTokens with
  const fdtParams = [
    // Valid params
    { name: 'test_FDT1', symbol: 'FDT1', totalSupply: '1000000', owner: () => owner, salt: 0xbadC0FEbebebe },
    { name: 'test_FDT2', symbol: 'FDT2', totalSupply: '3000000', owner: () => owner2, salt: 8954 },
    // Invalid params
    { name: 'non-unique_salt', symbol: 'FTD3', totalSupply: '2000000', owner: () => owner, salt: 8954 },
    { name: 'invalid_funds-token', symbol: 'FTD4', totalSupply: '4000000', owner: () => owner2, salt: 0xDEAD, fundsToken: ZERO_ADDRESS},
  ];

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [ creator, owner, owner2, tokenHolder, tokenHolder2 ] = self.accounts;
    self.txOpts.from = creator;

    const { options: { address: fundsTokenAddress }} = await deployPaymentToken(
        buidlerRuntime, owner, [ tokenHolder, tokenHolder2 ],
    );

    fdtParams.forEach((e) => {
      if (typeof e.owner === 'function') e.owner = e.owner();
      if (!e.fundsToken) e.fundsToken = fundsTokenAddress;
    });

    // expected values
    self.exp = {
      logicAbi: {
        ProxySafeVanillaFDT: self.ProxySafeVanillaFDTInstance.options.jsonInterface,
        ProxySafeSimpleRestrictedFDT: self.ProxySafeSimpleRestrictedFDTInstance.options.jsonInterface,
      },
      logicAddr: {
        ProxySafeVanillaFDT: self.ProxySafeVanillaFDTInstance.options.address,
        ProxySafeSimpleRestrictedFDT: self.ProxySafeSimpleRestrictedFDTInstance.options.address,
      },
      deployingAddr: self.FDTFactoryInstance.options.address,
      salt: [ fdtParams[0].salt, fdtParams[1].salt ],
    };
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
  });

  describe('createERC20Distributor(...)', async () => {
    before(async() => {
      await this.setupTestEnvironment()
      await invokeCreateFdtFunction.bind(this)('createERC20Distributor', 'ProxySafeVanillaFDT')
    });
    assertInvocationResults.bind(this)('ProxySafeVanillaFDT');
  });

  describe('createRestrictedERC20Distributor(...)', async () => {
    before(async() => {
      await this.setupTestEnvironment()
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
      const { name, symbol, totalSupply, owner, fundsToken, salt } = fdtParams[i];
      try {
        const tx = await self.FDTFactoryInstance
            .methods[fnName](name, symbol, totalSupply, fundsToken, owner, salt)
            .send(this.txOpts);
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
