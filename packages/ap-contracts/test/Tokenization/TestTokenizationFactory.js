const BigNumber = require('bignumber.js');
const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('actus-solidity/test/helper/parser');

const FDT_ETHExtension = artifacts.require('FDT_ETHExtension');

const {
  setupTestEnvironment,
  getDefaultTerms,
  convertDatesToOffsets,
  parseTermsToProductTerms,
  parseTermsToCustomTerms
} = require('../helper/setupTestEnvironment');


contract('TokenizationFactory', (accounts) => {
  const creatorObligor = accounts[0];
  const creatorBeneficiary = accounts[1];
  const counterpartyObligor = accounts[2];
  const counterpartyBeneficiary = accounts[3];

  const initialSupply = (new BigNumber(10000 * 10 ** 18)).toFixed();
  
  const assetId = 'C123';

  beforeEach(async () => {
    const instances = await setupTestEnvironment();
    Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

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
    this.protoSchedules = {
      nonCyclicSchedule: await this.PAMEngineInstance.computeNonCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate),
      cyclicIPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 8),
      cyclicPRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 15),
      cyclicSCSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 19),
      cyclicRRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 18),
      cyclicFPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 4),
      cyclicPYSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 11),
    };
    this.productId = 'Test Product';

    // register Ownership for assetId
    await this.AssetRegistryInstance.registerAsset(
      web3.utils.toHex(assetId), 
      this.ownership,
      web3.utils.toHex(this.productId),
      this.customTerms,
      this.state,
      this.PAMEngineInstance.address,
      '0x0000000000000000000000000000000000000000'
    );
  });

  it('should tokenize default beneficiary - ERC20', async () => {
    const tx = await this.TokenizationFactoryInstance.createERC20Distributor(
      'FundsDistributionToken',
      'FDT',
      initialSupply,
      "0x0000000000000000000000000000000000000001",
      { from: creatorBeneficiary }
    );

    const FDT_ERC20ExtensionInstance = await FDT_ETHExtension.at(
      tx.logs[0].args.distributor
    );

    await this.AssetRegistryInstance.setCreatorBeneficiary(
      web3.utils.toHex(assetId),
      FDT_ERC20ExtensionInstance.address,
      { from: creatorBeneficiary }
    );

    const storedCreatorBeneficiary = await this.AssetRegistryInstance.getOwnership(web3.utils.toHex(assetId));
    const balanceOfRecordCreatoBeneficiary = (await FDT_ERC20ExtensionInstance.balanceOf(creatorBeneficiary)).toString();

    assert.equal(storedCreatorBeneficiary.creatorBeneficiary, FDT_ERC20ExtensionInstance.address);
    assert.equal(balanceOfRecordCreatoBeneficiary, initialSupply);
  });
});
