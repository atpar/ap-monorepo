import Web3 from 'web3';
import { AP, Order } from '../../src';
import { OrderParams, ContractTerms } from '../../src/types'
import { IssuanceAPI, ContractsAPI } from '../../src/apis';

// @ts-ignore
import DefaultTerms from '../DefaultTerms.json';

// @ts-ignore
import Deployments from '@atpar/ap-contracts/deployments.json';

describe('IssuanceAPI', () => {
    let web3: Web3;
    let contractsAPI: ContractsAPI;
    let issuanceAPI: IssuanceAPI;
    let apRC: AP;
    let apCP: AP;
    let signedOrder: Order;
    let issuedAssetID: string;
    let recordCreator: string;
    let counterparty: string;
    const zeroAddress: string = "0x0000000000000000000000000000000000000000";

    beforeAll(async () => {
        web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
        contractsAPI = await ContractsAPI.init(web3);
        issuanceAPI = new IssuanceAPI(contractsAPI);

        recordCreator = (await web3.eth.getAccounts())[0];
        counterparty = (await web3.eth.getAccounts())[1];

        apRC = await AP.init(web3, recordCreator);
        apCP = await AP.init(web3, counterparty);


        const terms: ContractTerms = DefaultTerms;
        const orderParams: OrderParams = {
            makerAddress: recordCreator,
            terms,
            makerCreditEnhancementAddress: zeroAddress
          };
        const halfOrder = Order.create(apRC, orderParams);
        await halfOrder.signOrder();
        signedOrder = await Order.load(apCP, halfOrder.orderData);
        await signedOrder.signOrder();

        issuedAssetID = web3.utils.keccak256(
            web3.eth.abi.encodeParameters(
              ['bytes', 'bytes'],
              [signedOrder.orderData.signatures.makerSignature, signedOrder.orderData.signatures.takerSignature]
            )
          );
    })

    it('should instantiate IssuanceAPI', async () => {
        expect(issuanceAPI instanceof IssuanceAPI).toBe(true);
    })

    it('should create a valid transaction object to fill an order', async () => {
        const txObject = issuanceAPI.fillOrder(signedOrder.orderData);
        await txObject.send({from: recordCreator, gas: 2000000 });
    })

    it('should list the submitted order', async () => {
        const issuances = await issuanceAPI.getAssetIssuances();
        const lastIssuance = issuances[issuances.length-1];
        console.log(lastIssuance.assetId, issuedAssetID);

        expect(lastIssuance.assetId).toEqual(issuedAssetID);
    })
});