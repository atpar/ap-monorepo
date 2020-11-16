const { AP } = require('../dist/umd/index.js')
const Web3 = require('web3')
const ADDRESS_BOOK = require('../ap-chain/addresses.json');

let web3
describe('Integration Tests', () => {
  beforeEach(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
  });

  describe('Make sure lib imports', () => {

    it('ensure that AP initializes', async () => {
      const ap = await AP.init(web3, ADDRESS_BOOK);
      expect(ap.contracts.annRegistry.options.address).toEqual(ADDRESS_BOOK.ANNRegistry)
    });

  });
});