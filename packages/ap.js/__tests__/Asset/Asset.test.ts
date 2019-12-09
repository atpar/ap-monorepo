import Web3 from 'web3';
const ERC20SampleTokenArtifact = require('@atpar/ap-contracts/artifacts/ERC20SampleToken.min.json');

import { AP, Asset } from '../../src';
import { issueDefaultAsset } from '../utils';
import { decodeEvent } from '../../src/utils';


describe('Asset', () => {

  let web3: Web3;
  let creator: string;
  let counterparty: string;

  let apRC: AP;
  let apCP: AP;

  let assetId: string;


  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    creator = (await web3.eth.getAccounts())[0];
    counterparty = (await web3.eth.getAccounts())[1];

    apRC = await AP.init(web3, creator);
    apCP = await AP.init(web3, counterparty);

    assetId = await issueDefaultAsset();
  });

  it('should load Asset from registries for counterparty', async () => {
    const assetRC = await Asset.load(apRC, assetId);
    const assetCP = await Asset.load(apCP, assetId);

    const storedOwnershipRC = await assetRC.getOwnership();
    const storedTermsRC = await assetRC.getTerms();
    const storedOwnershipCP = await assetCP.getOwnership();
    const storedTermsCP = await assetCP.getTerms();

    expect(assetCP instanceof Asset).toBe(true);
    expect(storedOwnershipCP).toStrictEqual(storedOwnershipRC);
    expect(storedTermsCP.statusDate === storedTermsRC.statusDate).toBe(true);
  });

  it('should retrieve the next event of the asset', async () => {
    const asset = await Asset.load(apRC, assetId);
    const event = await asset.getNextEvent();
    const decodedEvent = decodeEvent(event);

    expect(decodedEvent.eventType > 0 && decodedEvent.scheduleTime > 0).toBe(true);
  });

  it('should retrieve the next payment data of the asset', async () => {
    const asset = await Asset.load(apRC, assetId);
    const payoff = await asset.getNextPayment();

    expect(Number(payoff.amount) > 0).toBe(true);
  });

  it('should tokenize creator beneficiary', async () => {
    const asset = await Asset.load(apRC, assetId);
    const distributorAddress = await asset.tokenizeBeneficiary(
      web3.utils.toHex('Distributor'),
      web3.utils.toHex('FDT'),
      web3.utils.toWei('10000')
    );

    const ownership = await asset.getOwnership();

    expect(ownership.creatorBeneficiary === distributorAddress).toBe(true);
  });

  it('should progress the asset state', async () => {
    const asset = await Asset.load(apRC, assetId);
    const terms = await asset.getTerms();
    const sampleToken = new web3.eth.Contract(ERC20SampleTokenArtifact.abi, terms.currency);
    const payoff = await asset.getNextPayment();
    const event = decodeEvent(await asset.getNextEvent());

    await sampleToken.methods.approve(apRC.contracts.assetActor.options.address, payoff.amount);
    const tx = await asset.progress();

    expect(Number(tx.events.AssetProgressed.returnValues.eventType)).toBe(event.eventType);
    expect(Number(tx.events.AssetProgressed.returnValues.scheduleTime)).toBe(event.scheduleTime);
  });
});
