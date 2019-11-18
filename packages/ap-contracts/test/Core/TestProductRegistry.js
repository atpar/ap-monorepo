const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('actus-solidity/test/helper/parser');

const { setupTestEnvironment, getDefaultTerms } = require('../helper/setupTestEnvironment');


contract('ProductRegistry', (accounts) => {
  const recordCreatorObligor = accounts[2];
  const recordCreatorBeneficiary = accounts[3];
  const counterpartyObligor = accounts[4];
  const counterpartyBeneficiary = accounts[5];

  before(async () => {
    const instances = await setupTestEnvironment();
    Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

    this.assetId = 'C123';
    this.terms = await getDefaultTerms();
    this.lifecycleTerms = parseTermsToLifecycleTerms(this.terms);
    this.generatingTerms = parseTermsToGeneratingTerms(this.terms);
    this.state = await this.PAMEngineInstance.computeInitialState(this.lifecycleTerms);
    this.ownership = { 
      recordCreatorObligor, 
      recordCreatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
    this.protoEventSchedules = {
      nonCyclicProtoEventSchedule: await this.PAMEngineInstance.computeNonCyclicProtoEventScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate),
      cyclicIPProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 8),
      cyclicPRProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 15),
      cyclicSCProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 19),
      cyclicRRProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 18),
      cyclicFPProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 4),
      cyclicPYProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 11),
    };
    this.productId = 'Test Product';
  });

  it('should register an asset', async () => {
    await this.ProductRegistryInstance.registerProduct(web3.utils.toHex(this.productId), this.terms, this.protoEventSchedules);

    const storedNonCyclicProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.ProductRegistryInstance.getNonCyclicProtoEventAtIndex(
        web3.utils.toHex(this.productId),
        i
      );

      storedNonCyclicProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicIPProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.ProductRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(this.productId),
        8,
        i
      );
      
      storedCyclicIPProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicPRProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.ProductRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(this.productId),
        15,
        i
      );
      
      storedCyclicPRProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicSCProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.ProductRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(this.productId),
        19,
        i
      );
      
      storedCyclicSCProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicRRProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.ProductRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(this.productId),
        18,
        i
      );
      
      storedCyclicRRProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicFPProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.ProductRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(this.productId),
        4,
        i
      );
      
      storedCyclicFPProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicPYProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.ProductRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(this.productId),
        11,
        i
      );
      
      storedCyclicPYProtoEventSchedule.push(protoEvent);
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
            return (web3.utils.isHexStrict(value) && value.length < 42) ? web3.utils.hexToNumberString(value) : value;
          default:
            return value;
        }
      });
    }

    assert.deepEqual(parseTerms(storedTerms), parseTerms(Object.values(this.lifecycleTerms)));

    assert.deepEqual(storedNonCyclicProtoEventSchedule, this.protoEventSchedules.nonCyclicProtoEventSchedule);
    assert.deepEqual(storedCyclicIPProtoEventSchedule, this.protoEventSchedules.cyclicIPProtoEventSchedule);
    assert.deepEqual(storedCyclicPRProtoEventSchedule, this.protoEventSchedules.cyclicPRProtoEventSchedule);
    assert.deepEqual(storedCyclicSCProtoEventSchedule, this.protoEventSchedules.cyclicSCProtoEventSchedule);
    assert.deepEqual(storedCyclicRRProtoEventSchedule, this.protoEventSchedules.cyclicRRProtoEventSchedule);
    assert.deepEqual(storedCyclicFPProtoEventSchedule, this.protoEventSchedules.cyclicFPProtoEventSchedule);
    assert.deepEqual(storedCyclicPYProtoEventSchedule, this.protoEventSchedules.cyclicPYProtoEventSchedule);
  });
});
