const { shouldFail } = require('openzeppelin-test-helpers');

const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('@atpar/actus-solidity/test/helper/parser');

const { setupTestEnvironment, getDefaultTerms } = require('../helper/setupTestEnvironment');

const { deriveTemplateId } = require('../helper/orderUtils');

const {
  normalizeDates,
  parseTermsToTemplateTerms,
  parseTermsToCustomTerms,
  generateTemplateSchedule,
  removeNullEvents
} = require('../helper/utils');


function parseTemplateTerms (array) {
  return array.map((value) => {
    switch (typeof value) {
      case 'object':
        return (Array.isArray(value)) ? parseTemplateTerms(value) : parseTemplateTerms(Object.values(value));
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
    this.generatingTerms = normalizeDates(parseTermsToGeneratingTerms(this.terms));
    this.templateTerms = parseTermsToTemplateTerms(this.terms);
    this.customTerms = parseTermsToCustomTerms(this.terms);

    this.state = await this.PAMEngineInstance.computeInitialState(this.lifecycleTerms);
    this.ownership = { 
      creatorObligor, 
      creatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
    this.templateSchedule = await generateTemplateSchedule(this.PAMEngineInstance, this.generatingTerms);
  });

  // todo: add test which uses convenience method getSchedule
  it('should register an asset', async () => {
    const tx = await this.TemplateRegistryInstance.registerTemplate(this.templateTerms, this.templateSchedule);
    const templateId = tx.logs[0].args.templateId;

    const storedTemplateTerms = await this.TemplateRegistryInstance.getTemplateTerms(web3.utils.toHex(templateId));
    const storedTemplateSchedule = await this.TemplateRegistryInstance.getSchedule(web3.utils.toHex(templateId));
    
    assert.deepEqual(parseTemplateTerms(storedTemplateTerms), parseTemplateTerms(Object.values(this.templateTerms)));
    assert.deepEqual(storedTemplateSchedule, removeNullEvents(this.templateSchedule));
  });

  it('should not register same template twice', async () => {
    await shouldFail.reverting.withMessage(
      this.TemplateRegistryInstance.registerTemplate(this.templateTerms, this.templateSchedule),
      'TemplateRegistry.registerTemplate: ENTRY_ALREADY_EXISTS'
    );
  });  
});
