/*jslint node*/
/*global before, beforeEach, describe, it, web3*/
const assert = require('assert');
const bre = require('@nomiclabs/buidler');
const { BN } = require('openzeppelin-test-helpers');

const { ZERO_ADDRESS } = require('../helper/utils');
const { getSnapshotTaker } = require('../helper/setupTestEnvironment');
const {
  buildCreate2Eip1167ProxyAddress: buildProxyAddr,
  getEip1167ProxyLogicAddress: extractLogicAddr,
} = require('../helper/proxy/create2.js')(web3);

describe('ICTFactory', () => {
  const logicContract = 'ProxySafeICT'
  const b32 = web3.utils.hexToBytes;
  const ictParams = [
    // Valid params
    { marketObjectCode: b32('0xDAD'), owner: () => owner, salt: 0xbadC0FEbebebe },
    { marketObjectCode: b32('0xADA'), owner: () => owner2, salt: 8954 },
    // Invalid params
    { marketObjectCode: b32('0xBAB'), owner: () => owner2, salt: 8954 }, // duplicated salt
    { marketObjectCode: b32('0xABA'), owner: () => owner2, salt: 0xDEAD, assetRegistry: ZERO_ADDRESS},
    { marketObjectCode: b32('0xAAA'), owner: () => owner2, salt: 0xDEAD2, dataRegistry: ZERO_ADDRESS},
  ];
  let creator, owner, owner2;

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(bre, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [creator, owner, owner2] = self.accounts;
    self.txOpts.from = creator;

    ictParams.forEach((e) => {
      e.assetRegistry = e.assetRegistry || self.ANNRegistryInstance.options.address;
      e.dataRegistry = e.dataRegistry || self.DataRegistryInstance.options.address;
      e.name = "Investment Certificate Token";
      e.symbol = "ICT";
      if (typeof e.owner === 'function') e.owner = e.owner();
    });

    // expected values
    self.exp = {
      logicAbi: self.ProxySafeICTInstance.options.jsonInterface,
      logicAddr: self.ProxySafeICTInstance.options.address,
      deployingAddr: self.ICTFactoryInstance.options.address,
      salt: [ictParams[0].salt, ictParams[1].salt],
    };
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
  });

  describe('createICToken(...)', async () => {

    before(async() => {
      await this.setupTestEnvironment()
      await invokeCreateIctFunction.bind(this)('createICToken')
    });

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
          assert.strictEqual(extractLogicAddr(this.act[0].proxyBytecode), this.exp.logicAddr);
          assert.strictEqual(extractLogicAddr(this.act[1].proxyBytecode), this.exp.logicAddr);
        });

        it('should write to the storage of the proxy', () => {
          assert.strictEqual(this.act[0].icToken.symbol, ictParams[0].symbol);
          assert.strictEqual(this.act[1].icToken.symbol, ictParams[1].symbol);
        });

        it(`should not write to the pre-deployed ${logicContract} storage`, () => {
          assert.strictEqual(this.act.logicStorage.symbol, '');
          assert.strictEqual(this.act.logicStorage.name, '');
          assert.strictEqual(this.act.logicStorage.assetRegistry, '0x0000000000000000000000000000000000000000');
          assert.strictEqual(this.act.logicStorage.dataRegistry, '0x0000000000000000000000000000000000000000');
        });

      });
    });

    describe('Applying `CREATE2` to deploy a proxy', () => {

      describe('For a salt given', () => {
        it('should deploy a new proxy instance at a pre-defined address', () => {
          assert.strictEqual(this.act[0].proxy, buildProxyAddr(
              this.exp.deployingAddr,
              this.exp.salt[0],
              this.exp.logicAddr
          ));
          assert.strictEqual(this.act[1].proxy, buildProxyAddr(
              this.exp.deployingAddr,
              this.exp.salt[1],
              this.exp.logicAddr
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
        ([ictParams[0], ictParams[1]]).map((expected, i) => {
          const actual = this.act[i].icToken;
          ['name', 'symbol', 'assetRegistry', 'dataRegistry', 'owner'].forEach(
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
          assert.strictEqual(this.act[0].logic, this.exp.logicAddr);
          assert.strictEqual(this.act[1].logic, this.exp.logicAddr);
        });
        it('should provide the CREATE2 salt', () => {
          assert.strictEqual(this.act[0].salt, (new BN(this.exp.salt[0])).toString());
          assert.strictEqual(this.act[1].salt, (new BN(this.exp.salt[1])).toString());
        });
      });

      describe('With the DeployedICT event emitted', () => {
        it(`should provide the new instantiated ${logicContract} address`, async () => {
          assert(web3.utils.isAddress(this.act[0].icTokenAddr));
          assert(web3.utils.isAddress(this.act[1].icTokenAddr));
        });
        it('should provide the creator address', () => {
          assert.strictEqual(this.act[0].creator, creator);
          assert.strictEqual(this.act[1].creator, creator);
        });
      });

    });

    describe('When called with zero address of the asset registry', () => {
      it('reverts', () => {
        assert(this.act[3].message.toLowerCase().includes('revert'));
      });
    });

    describe('When called with zero address of the data registry', () => {
      it('reverts', () => {
        assert(this.act[4].message.toLowerCase().includes('revert'));
      });
    });

    describe(`New ${logicContract} instance instantiated`, () => {
      it('should have the address of the proxy', () => {
        assert.strictEqual(this.act[0].icTokenAddr, this.act[0].proxy);
        assert.strictEqual(this.act[1].icTokenAddr, this.act[1].proxy);
      });
    });
  });

  async function invokeCreateIctFunction(fnName) {
    const self = this;
    // actual values
    this.act = [];

    // deploy ICTokens calling `fnName` for every `ictParams[i]`
    for (let i = 0; i < ictParams.length; i++) {
      const {assetRegistry, dataRegistry, marketObjectCode, owner, salt} = ictParams[i];
      try {
        const tx = await self.ICTFactoryInstance
            .methods[fnName](assetRegistry, dataRegistry, marketObjectCode, owner, salt)
            .send(this.txOpts);
        const actual = decodeEvents(tx);
        actual.proxyBytecode = await web3.eth.getCode(actual.proxy);
        actual.icToken = await readTokenStorage(
            new web3.eth.Contract(this.exp.logicAbi, actual.proxy)
        );
        this.act.push(actual);
      }
      // values may be intentionally invalid
      catch (error) {
        this.act.push(error);
      }
    }
    this.act.logicStorage = await readTokenStorage(
        new web3.eth.Contract(this.exp.logicAbi, this.exp.logicAddr)
    );
  }

  function decodeEvents(tx) {
    const {returnValues: { proxy, logic, salt: saltBN }, address: proxyFactory} = tx.events.NewEip1167Proxy;
    const { icToken: icTokenAddr, creator } = tx.events.DeployedICT.returnValues;
    const salt = saltBN.toString();
    return { proxy, logic, salt, icTokenAddr, creator, proxyFactory };
  }

  async function readTokenStorage(contract) {
    return Promise.all([
      contract.methods.name().call(),
      contract.methods.symbol().call(),
      contract.methods.assetRegistry().call(),
      contract.methods.dataRegistry().call(),
      contract.methods.owner().call(),
    ]).then(([ name, symbol, assetRegistry, dataRegistry, owner ]) => ({ name, symbol, assetRegistry, dataRegistry, owner }));
  }
});
