const { shouldFail } = require('openzeppelin-test-helpers');

const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('actus-solidity/test/helper/parser');

const { setupTestEnvironment, getDefaultTerms } = require('../helper/setupTestEnvironment');

const { deriveTemplateId } = require('../helper/orderUtils');

const {
  convertDatesToOffsets,
  parseTermsToTemplateTerms,
  parseTermsToCustomTerms
} = require('../helper/utils');


contract('TemplateRegistry', (accounts) => {
  const creatorObligor = accounts[1];
  const creatorBeneficiary = accounts[2];
  const counterpartyObligor = accounts[3];
  const counterpartyBeneficiary = accounts[4];

  before(async () => {
    const instances = await setupTestEnvironment(accounts);
    Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

    this.assetId = 'C123';
    this.terms = await getDefaultTerms();

    // derive LifecycleTerms, GeneratingTerms, TemplateTerms and CustomTerms
    this.lifecycleTerms = parseTermsToLifecycleTerms(this.terms);
    this.generatingTerms = convertDatesToOffsets(parseTermsToGeneratingTerms(this.terms));
    this.templateTerms = parseTermsToTemplateTerms(this.terms);
    this.customTerms = parseTermsToCustomTerms(this.terms);

    this.state = await this.PAMEngineInstance.computeInitialState(this.lifecycleTerms);
    this.ownership = { 
      creatorObligor, 
      creatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
    this.templateSchedules = {
      nonCyclicSchedule: await this.PAMEngineInstance.computeNonCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate),
      cyclicIPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 8),
      cyclicPRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 15),
      cyclicSCSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 19),
      cyclicRRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 18),
      cyclicFPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 4),
      cyclicPYSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 11),
    };
    this.templateId = deriveTemplateId(this.templateTerms, this.templateSchedules);
  });

  it('should register an asset', async () => {
    await this.TemplateRegistryInstance.registerTemplate(this.templateTerms, this.templateSchedules);

    const storedNonCyclicSchedule = [];
    for (let i = 0; i < 64; i++) {
      const _event = await this.TemplateRegistryInstance.getEventAtIndex(
        web3.utils.toHex(this.templateId),
        255,
        i
      );

      storedNonCyclicSchedule.push(_event);
    }

    const storedCyclicIPSchedule = [];
    for (let i = 0; i < 64; i++) {
      const _event = await this.TemplateRegistryInstance.getEventAtIndex(
        web3.utils.toHex(this.templateId),
        8,
        i
      );
      
      storedCyclicIPSchedule.push(_event);
    }

    const storedCyclicPRSchedule = [];
    for (let i = 0; i < 64; i++) {
      const _event = await this.TemplateRegistryInstance.getEventAtIndex(
        web3.utils.toHex(this.templateId),
        15,
        i
      );
      
      storedCyclicPRSchedule.push(_event);
    }

    const storedCyclicSCSchedule = [];
    for (let i = 0; i < 64; i++) {
      const _event = await this.TemplateRegistryInstance.getEventAtIndex(
        web3.utils.toHex(this.templateId),
        19,
        i
      );
      
      storedCyclicSCSchedule.push(_event);
    }

    const storedCyclicRRSchedule = [];
    for (let i = 0; i < 64; i++) {
      const _event = await this.TemplateRegistryInstance.getEventAtIndex(
        web3.utils.toHex(this.templateId),
        18,
        i
      );
      
      storedCyclicRRSchedule.push(_event);
    }

    const storedCyclicFPSchedule = [];
    for (let i = 0; i < 64; i++) {
      const _event = await this.TemplateRegistryInstance.getEventAtIndex(
        web3.utils.toHex(this.templateId),
        4,
        i
      );
      
      storedCyclicFPSchedule.push(_event);
    }

    const storedCyclicPYSchedule = [];
    for (let i = 0; i < 64; i++) {
      const _event = await this.TemplateRegistryInstance.getEventAtIndex(
        web3.utils.toHex(this.templateId),
        11,
        i
      );
      
      storedCyclicPYSchedule.push(_event);
    }

    const storedTerms = await this.TemplateRegistryInstance.getTemplateTerms(web3.utils.toHex(this.templateId));

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

    assert.deepEqual(parseTerms(storedTerms), parseTerms(Object.values(this.templateTerms)));

    assert.deepEqual(storedNonCyclicSchedule, this.templateSchedules.nonCyclicSchedule);
    assert.deepEqual(storedCyclicIPSchedule, this.templateSchedules.cyclicIPSchedule);
    assert.deepEqual(storedCyclicPRSchedule, this.templateSchedules.cyclicPRSchedule);
    assert.deepEqual(storedCyclicSCSchedule, this.templateSchedules.cyclicSCSchedule);
    assert.deepEqual(storedCyclicRRSchedule, this.templateSchedules.cyclicRRSchedule);
    assert.deepEqual(storedCyclicFPSchedule, this.templateSchedules.cyclicFPSchedule);
    assert.deepEqual(storedCyclicPYSchedule, this.templateSchedules.cyclicPYSchedule);
  });

  it('should not register same template twice', async () => {
    await shouldFail.reverting.withMessage(
      this.TemplateRegistryInstance.registerTemplate(this.templateTerms, this.templateSchedules),
      'TemplateRegistry.registerTemplate: ENTRY_ALREADY_EXISTS'
    );
  });  
});
