const BigNumber = require('bignumber.js');
const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('actus-solidity/test/helper/parser');

const TokenizationFactory = artifacts.require('TokenizationFactory');
const FDT_ETHExtension = artifacts.require('FDT_ETHExtension');

const { setupTestEnvironment, getDefaultTerms } = require('../helper/setupTestEnvironment');


contract('TokenizationFactory', (accounts) => {
  const recordCreatorObligor = accounts[0];
  const recordCreatorBeneficiary = accounts[1];
  const counterpartyObligor = accounts[2];
  const counterpartyBeneficiary = accounts[3];

  const initialSupply = (new BigNumber(10000 * 10 ** 18)).toFixed();
  
  const assetId = 'C123';
  const cashflowId = 5;
  const payoffAmount = 2 * 10  ** 15;

  beforeEach(async () => {
    const instances = await setupTestEnvironment();
    Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

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

    // register Ownership for assetId
    await this.AssetRegistryInstance.registerAsset(
      web3.utils.toHex(assetId), 
      this.ownership,
      web3.utils.toHex(this.productId),
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
      { from: recordCreatorBeneficiary }
    );

    const FDT_ERC20ExtensionInstance = await FDT_ETHExtension.at(
      tx.logs[0].args.distributor
    );

    await this.AssetRegistryInstance.setRecordCreatorBeneficiary(
      web3.utils.toHex(assetId),
      FDT_ERC20ExtensionInstance.address,
      { from: recordCreatorBeneficiary }
    );

    const storedRecordCreatorBeneficiary = await this.AssetRegistryInstance.getOwnership(web3.utils.toHex(assetId));
    const balanceOfRecordCreatoBeneficiary = (await FDT_ERC20ExtensionInstance.balanceOf(recordCreatorBeneficiary)).toString();

    assert.equal(storedRecordCreatorBeneficiary.recordCreatorBeneficiary, FDT_ERC20ExtensionInstance.address);
    assert.equal(balanceOfRecordCreatoBeneficiary, initialSupply);
  });
});
