const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('actus-solidity/test/helper/parser');

const { 
  setupTestEnvironment,
  getDefaultTerms,
  convertDatesToOffsets,
  parseTermsToProductTerms,
  parseTermsToCustomTerms
} = require('../helper/setupTestEnvironment');


contract('ProductRegistry', (accounts) => {
  const creatorObligor = accounts[2];
  const creatorBeneficiary = accounts[3];
  const counterpartyObligor = accounts[4];
  const counterpartyBeneficiary = accounts[5];

  before(async () => {
    const instances = await setupTestEnvironment();
    Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

    this.assetId = 'C123';
    this.terms = await getDefaultTerms();

    // derive LifecycleTerms, GeneratingTerms, ProductTerms and CustomTerms
    this.lifecycleTerms = parseTermsToLifecycleTerms(this.terms);
    this.generatingTerms = convertDatesToOffsets(parseTermsToGeneratingTerms(this.terms));
    this.productTerms = parseTermsToProductTerms(this.terms);
    this.customTerms = parseTermsToCustomTerms(this.terms);

    this.state = await this.PAMEngineInstance.computeInitialState(this.lifecycleTerms);
    this.ownership = { 
      creatorObligor, 
      creatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
    this.productSchedules = {
      nonCyclicSchedule: await this.PAMEngineInstance.computeNonCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate),
      cyclicIPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 8),
      cyclicPRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 15),
      cyclicSCSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 19),
      cyclicRRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 18),
      cyclicFPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 4),
      cyclicPYSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 11),
    };
    this.productId = 'Test Product';
  });

  it('should register an asset', async () => {
    await this.ProductRegistryInstance.registerProduct(web3.utils.toHex(this.productId), this.productTerms, this.productSchedules);

    const storedNonCyclicSchedule = [];
    for (let i = 0; i < 64; i++) {
      const _event = await this.ProductRegistryInstance.getEventAtIndex(
        web3.utils.toHex(this.productId),
        255,
        i
      );

      storedNonCyclicSchedule.push(_event);
    }

    const storedCyclicIPSchedule = [];
    for (let i = 0; i < 64; i++) {
      const _event = await this.ProductRegistryInstance.getEventAtIndex(
        web3.utils.toHex(this.productId),
        8,
        i
      );
      
      storedCyclicIPSchedule.push(_event);
    }

    const storedCyclicPRSchedule = [];
    for (let i = 0; i < 64; i++) {
      const _event = await this.ProductRegistryInstance.getEventAtIndex(
        web3.utils.toHex(this.productId),
        15,
        i
      );
      
      storedCyclicPRSchedule.push(_event);
    }

    const storedCyclicSCSchedule = [];
    for (let i = 0; i < 64; i++) {
      const _event = await this.ProductRegistryInstance.getEventAtIndex(
        web3.utils.toHex(this.productId),
        19,
        i
      );
      
      storedCyclicSCSchedule.push(_event);
    }

    const storedCyclicRRSchedule = [];
    for (let i = 0; i < 64; i++) {
      const _event = await this.ProductRegistryInstance.getEventAtIndex(
        web3.utils.toHex(this.productId),
        18,
        i
      );
      
      storedCyclicRRSchedule.push(_event);
    }

    const storedCyclicFPSchedule = [];
    for (let i = 0; i < 64; i++) {
      const _event = await this.ProductRegistryInstance.getEventAtIndex(
        web3.utils.toHex(this.productId),
        4,
        i
      );
      
      storedCyclicFPSchedule.push(_event);
    }

    const storedCyclicPYSchedule = [];
    for (let i = 0; i < 64; i++) {
      const _event = await this.ProductRegistryInstance.getEventAtIndex(
        web3.utils.toHex(this.productId),
        11,
        i
      );
      
      storedCyclicPYSchedule.push(_event);
    }

    const storedTerms = await this.ProductRegistryInstance.getProductTerms(web3.utils.toHex(this.productId));

    function parseTerms (array) {
      return array.map((value) => {
        switch (typeof value) {
          case 'object':
            return (Array.isArray(value)) ? parseTerms(value) : parseTerms(Object.values(value));
          case 'number':
            return value.toString();
          case 'boolean':
            return value;
          case 'string':
            return (web3.utils.isHexStrict(value) && value.length < 42)
              ? web3.utils.hexToNumberString(value)
              : (value !== '0x0000000000000000000000000000000000000000000000000000000000000000')
                ? value
                : "0";
          default:
            return value;
        }
      });
    }

    assert.deepEqual(parseTerms(storedTerms), parseTerms(Object.values(this.productTerms)));

    assert.deepEqual(storedNonCyclicSchedule, this.productSchedules.nonCyclicSchedule);
    assert.deepEqual(storedCyclicIPSchedule, this.productSchedules.cyclicIPSchedule);
    assert.deepEqual(storedCyclicPRSchedule, this.productSchedules.cyclicPRSchedule);
    assert.deepEqual(storedCyclicSCSchedule, this.productSchedules.cyclicSCSchedule);
    assert.deepEqual(storedCyclicRRSchedule, this.productSchedules.cyclicRRSchedule);
    assert.deepEqual(storedCyclicFPSchedule, this.productSchedules.cyclicFPSchedule);
    assert.deepEqual(storedCyclicPYSchedule, this.productSchedules.cyclicPYSchedule);
  });
});
