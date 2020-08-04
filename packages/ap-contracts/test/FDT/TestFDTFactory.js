/* global assert, before, describe, it */
const { BN, expectEvent } = require('openzeppelin-test-helpers');

const { ZERO_ADDRESS } = require('../helper/utils');
const { setupTestEnvironment, deployPaymentToken } = require('../helper/setupTestEnvironment');
const {
  buildCreate2Eip1167ProxyAddress: buildProxyAddr,
  getEip1167ProxyLogicAddress: extractLogicAddr,
} = require('../helper/proxy/create2.js')(web3);

contract('FDTFactory', function (accounts) {
  const [creator, owner, owner2, tokenHolder1, anyone] = accounts;

  const fdtParams = [
    // Valid params
    { name: 'test FDT1', symbol: 'FDT1', totalSupply: '1000000', owner: owner, salt: 0xbadC0FEbebebe },
    { name: 'test FDT2', symbol: 'FDT2', totalSupply: '3000000', owner: owner2, salt: 8954 },
    // Invalid params
    { name: 'non-unique salt', symbol: 'FTD3', totalSupply: '2000000', owner: owner2, salt: 8954 },
    { name: 'zero_address', symbol: 'FTD4', totalSupply: '4000000', owner: owner2, salt: 0xDEAD, fundsToken: ZERO_ADDRESS},
  ];

  before(async () => {
    this.instances =  await setupTestEnvironment(accounts);
    this.fundsToken = await deployPaymentToken(owner, [owner2, tokenHolder1, anyone]);
    fdtParams.forEach(e => e.fundsToken = e.fundsToken || this.fundsToken.address);
  });

  describe('createERC20Distributor(...)', async () => {
    testCreateDistributor.bind(this)('createERC20Distributor');
  });

  describe('createRestrictedERC20Distributor(...)', async () => {
    testCreateDistributor.bind(this)('createRestrictedERC20Distributor');
  });

  function testCreateDistributor(fnName) {
    const [logicName, tokenName] = ({
      createERC20Distributor: ['ProxySafeVanillaFDT', 'VanillaFDT'],
      createRestrictedERC20Distributor: ['ProxySafeSimpleRestrictedFDT', 'SimpleRestrictedFDT'],
    })[fnName];
    if (!logicName) throw new Error('invalid fnName');

    before(async () => {
      const exp = {
        logicAbi: this.instances[`${logicName}Instance`].abi,
        logicAddr: this.instances[`${logicName}Instance`].address,
        deployingAddr: this.instances.FDTFactoryInstance.address,
        salt: [ fdtParams[0].salt, fdtParams[1].salt ],
      };
      this.exp = exp;

      // deploy FDTokens
      const createFn = this.instances.FDTFactoryInstance[fnName].bind(this.instances.FDTFactoryInstance);
      this.act = await Promise.all(fdtParams.map(async (params) => {
        try {
          let actual = decodeEvents(await createFDT(createFn, params));
          actual.proxyBytecode = await web3.eth.getCode(actual.proxy);
          actual.fdToken = await readTokenStorage(new web3.eth.Contract(exp.logicAbi, actual.proxy));
          return actual;
        }
        // 3rd and 4th tokens expected to fail
        catch (error) { return error; }
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
          assert(act[0].fdToken.symbol === fdtParams[0].symbol);
          assert(act[1].fdToken.symbol === fdtParams[1].symbol);
        });

        it(`should not write to the pre-deployed ${logicName} storage`, () => {
          assert(this.act.logicStorage.symbol === '');
          assert(this.act.logicStorage.name === '');
          assert(this.act.logicStorage.totalSupply === '0');
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
        ([fdtParams[0], fdtParams[1]]).map((expected, i) => {
          const actual = act[i].fdToken;
          ['name', 'symbol', 'totalSupply', 'owner'].forEach(
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

      describe('With the DeployedDistributor event emitted', () => {
        it(`should provide the new instantiated ${logicName} address`, async () => {
          assert(web3.utils.isAddress(act[0].distributor));
          assert(web3.utils.isAddress(act[1].distributor));
        });
        it('should provide the creator address', () => {
          assert(act[0].creator === creator);
          assert(act[1].creator === creator);
        });
      });

    });

    describe('When called with zero address of the funds token', () => {
      it('reverts', () => {
        assert(act[3].message.toLowerCase().includes('revert'));
      });
    });

    describe(`New ${logicName} instance instantiated`, () => {
      it('should have the address of the proxy', () => {
        assert(act[0].distributor === act[0].proxy);
        assert(act[1].distributor === act[1].proxy);
      });
    });
  }

  async function createFDT(createFn, {name, symbol, totalSupply, owner, fundsToken, salt}) {
    return createFn(name, symbol, totalSupply, fundsToken, owner, salt);
  }

  function decodeEvents(tx) {
    const {args: { proxy, logic, salt: saltBN }, address: proxyFactory} = expectEvent.inLogs(tx.logs, 'NewEip1167Proxy');
    const { distributor, creator } = expectEvent.inLogs(tx.logs, 'DeployedDistributor').args;
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
