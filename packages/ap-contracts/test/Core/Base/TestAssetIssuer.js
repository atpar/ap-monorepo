const BigNumber = require('bignumber.js');
const { expectEvent } = require('openzeppelin-test-helpers');

const { setupTestEnvironment, getDefaultTerms, deployPaymentToken } = require('../helper/setupTestEnvironment');
const { createSnapshot, revertToSnapshot } = require('../helper/blockchain');
const { ZERO_ADDRESS, ZERO_BYTES32, generateSchedule, parseTerms } = require('../helper/utils');

const CECCollateralTerms = require('../helper/terms/cec-collateral-terms.json');


contract('AssetIssuer', (accounts) => {
  const creator = accounts[1];
  const counterparty = accounts[2];

  let snapshot;

  before(async () => {
    this.instances = await setupTestEnvironment(accounts);
    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    this.ownership = {
      creatorObligor: creator,
      creatorBeneficiary: creator,
      counterpartyObligor: counterparty,
      counterpartyBeneficiary: counterparty
    };

    // deploy test ERC20 token
    this.PaymentTokenInstance = await deployPaymentToken(this.ownership.creatorObligor,[this.ownership.counterpartyBeneficiary]);
    // set address of payment token as currency in terms
    this.terms = await getDefaultTerms();
    this.terms.currency = this.PaymentTokenInstance.address;
    this.terms.settlementCurrency = this.PaymentTokenInstance.address;
    this.terms.statusDate = this.terms.contractDealDate;

    this.engine = this.PAMEngineInstance.address;
    this.schedule = await generateSchedule(this.PAMEngineInstance, this.terms);

    this.state = await this.PAMEngineInstance.computeInitialState(this.terms);

    snapshot = await createSnapshot();
  });

  after(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should issue an asset from a draft', async () => {
    const tx = await this.AssetIssuerInstance.issueAsset(
      ZERO_BYTES32, // getTermsHash(terms),
      this.terms,
      this.schedule,
      this.ownership,
      this.engine,
      ZERO_ADDRESS
    );
    const assetId = tx.logs[0].args.assetId;
    const storedEngineAddress = await this.AssetRegistryInstance.getEngine(assetId);
    const storedTerms = await this.AssetRegistryInstance.getPAMTerms(assetId);
    const storedState = await this.AssetRegistryInstance.getState(assetId);

    assert.equal(storedEngineAddress, this.engine);
    assert.deepEqual(parseTerms(storedTerms), parseTerms(Object.values(this.terms)));
    assert.deepEqual(storedState, this.state);
  });
});
