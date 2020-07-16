/* global assert, before, describe, it */
const { BN, expectEvent } = require('openzeppelin-test-helpers');

const { ZERO_ADDRESS } = require('../helper/utils');
const { setupTestEnvironment } = require('../helper/setupTestEnvironment');
const {
  buildCreate2Eip1167ProxyAddress: buildProxyAddr,
  getEip1167ProxyLogicAddress: extractLogicAddr,
} = require('../helper/proxy/create2.js')(web3);

contract('ICTFactory', function (accounts) {
  const [creator, owner, owner2] = accounts;
  const b32 = web3.utils.hexToBytes;

  const ictParams = [
    // Valid params
    { marketObjectCode: b32('0xDAD'), owner: owner, salt: 0xbadC0FEbebebe },
    { marketObjectCode: b32('0xADA'), owner: owner2, salt: 8954 },
    // Invalid params
    { marketObjectCode: b32('0xBAB'), owner: owner2, salt: 8954 }, // duplicated salt
    { marketObjectCode: b32('0xABA'), owner: owner2, salt: 0xDEAD, assetRegistry: ZERO_ADDRESS},
    { marketObjectCode: b32('0xAAA'), owner: owner2, salt: 0xDEAD2, dataRegistry: ZERO_ADDRESS},
  ];

  before(async () => {
    this.instances =  await setupTestEnvironment(accounts);
    ictParams.forEach((e) => {
      e.assetRegistry = e.assetRegistry || this.instances.ANNRegistryInstance.address;
      e.dataRegistry = e.dataRegistry || this.instances.DataRegistryInstance.address;
      e.name = "Investment Certificate Token";
      e.symbol = "ICT";
    });
  });

  describe('createICToken(...)', async () => {
    testCreateICToken.bind(this)('createICToken');
  });

  function testCreateICToken(fnName) {
    // reserved for more `fName`s
    const [logicName, tokenName] = ({
      createICToken: ['UpgradeSafeICT', 'ICT'],
    })[fnName];
    if (!logicName) throw new Error('invalid fnName');

    before(async () => {
      // assetRegistry, dataRegistry, marketObjectCode, owner
      const exp = {
        logicAbi: this.instances[`${logicName}Instance`].abi,
        logicAddr: this.instances[`${logicName}Instance`].address,
        deployingAddr: this.instances.ICTFactoryInstance.address,
        salt: [ ictParams[0].salt, ictParams[1].salt ],
      };
      this.exp = exp;

      // deploy ICTokens
      const createFn = this.instances.ICTFactoryInstance[fnName].bind(this.instances.ICTFactoryInstance);
      this.act = await Promise.all(ictParams.map(async (params) => {
        try {
          let actual = decodeEvents(await createICT(createFn, params));
          actual.proxyBytecode = await web3.eth.getCode(actual.proxy);
          actual.icToken = await readTokenStorage(new web3.eth.Contract(exp.logicAbi, actual.proxy));
          return actual;
        }
        // 3rd, 4th and 5th tokens expected to fail
        catch (error) {
          return error; }
      }));
      this.act.logicStorage = await readTokenStorage(new web3.eth.Contract(exp.logicAbi, exp.logicAddr));
    });

    describe('Following the "proxy-implementation" pattern', () => {

      it(`should deploy a new proxy`, () => {
        assert(act[0].proxyBytecode.length > 0);
        assert(act[1].proxyBytecode.length > 0);
      });

      describe('The new proxy deployed', () => {
        it('should be the EIP-1167 proxy', () => {
          assert(web3.utils.isAddress(extractLogicAddr(act[0].proxyBytecode)));
          assert(web3.utils.isAddress(extractLogicAddr(act[1].proxyBytecode)));
        });
      });

      describe('Being a `delegatecall`', () => {

        it(`should be forwarded to a pre-deployed ${logicName}`, () => {
          assert(extractLogicAddr(act[0].proxyBytecode) === exp.logicAddr);
          assert(extractLogicAddr(act[1].proxyBytecode) === exp.logicAddr);
        });

        it('should write to the storage of the proxy', () => {
          assert(act[0].icToken.symbol === ictParams[0].symbol);
          assert(act[1].icToken.symbol === ictParams[1].symbol);
        });

        it(`should not write to the pre-deployed ${logicName} storage`, () => {
          assert(this.act.logicStorage.symbol === '');
          assert(this.act.logicStorage.name === '');
          assert(this.act.logicStorage.assetRegistry === '0x0000000000000000000000000000000000000000');
          assert(this.act.logicStorage.dataRegistry === '0x0000000000000000000000000000000000000000');
        });

      });
    });

    describe('Applying `CREATE2` to deploy a proxy', () => {

      describe('For a salt given', () => {
        it('should deploy a new proxy instance at a pre-defined address', () => {
          assert(act[0].proxy === buildProxyAddr(exp.deployingAddr, exp.salt[0], exp.logicAddr));
          assert(act[1].proxy === buildProxyAddr(exp.deployingAddr, exp.salt[1], exp.logicAddr));
        });
      });

      describe('If the salt was already used to deploy another proxy', () => {
        it('reverts', () => {
          assert(act[2].message.toLowerCase().includes('revert'));
        });
      });
    });

    describe('When called with valid params', () => {

      it(`should instantiate a new ${logicName} instance`, () => {
        ([ictParams[0], ictParams[1]]).map((expected, i) => {
          const actual = act[i].icToken;
          ['name', 'symbol', 'assetRegistry', 'dataRegistry', 'owner'].forEach(
              key => assert(actual[key] === expected[key], `${key} (${i})`),
          )
        });
      });

      describe('With the NewEip1167Proxy event emitted', () => {
        it('should provide the new proxy address', () => {
          assert(web3.utils.isAddress(act[0].proxy));
          assert(web3.utils.isAddress(act[1].proxy));
        });
        it(`should provide the pre-deployed ${logicName} address`, () => {
          assert(act[0].logic === exp.logicAddr);
          assert(act[1].logic === exp.logicAddr);
        });
        it('should provide the CREATE2 salt', () => {
          assert(act[0].salt === (new BN(exp.salt[0])).toString());
          assert(act[1].salt === (new BN(exp.salt[1])).toString());
        });
      });

      describe('With the DeployedICT event emitted', () => {
        it(`should provide the new instantiated ${logicName} address`, async () => {
          assert(web3.utils.isAddress(act[0].icTokenAddr));
          assert(web3.utils.isAddress(act[1].icTokenAddr));
        });
        it('should provide the creator address', () => {
          assert(act[0].creator === creator);
          assert(act[1].creator === creator);
        });
      });

    });

    describe('When called with zero address of the asset registry', () => {
      it('reverts', () => {
        assert(act[3].message.toLowerCase().includes('revert'));
      });
    });

    describe('When called with zero address of the data registry', () => {
      it('reverts', () => {
        assert(act[4].message.toLowerCase().includes('revert'));
      });
    });

    describe(`New ${logicName} instance instantiated`, () => {
      it('should have the address of the proxy', () => {
        assert(act[0].icTokenAddr === act[0].proxy);
        assert(act[1].icTokenAddr === act[1].proxy);
      });
    });
  }

  async function createICT(createFn, {assetRegistry, dataRegistry, marketObjectCode, owner, salt}) {
    return createFn(assetRegistry, dataRegistry, marketObjectCode, owner, salt);
  }

  function decodeEvents(tx) {
    const {args: { proxy, logic, salt: saltBN }, address: proxyFactory} = expectEvent.inLogs(tx.logs, 'NewEip1167Proxy');
    const { icToken: icTokenAddr, creator } = expectEvent.inLogs(tx.logs, 'DeployedICT').args;
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
