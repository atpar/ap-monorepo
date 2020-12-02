// import Web3 from 'web3';

// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const SettlementToken = require('build/SettlementToken.json');

// import { AP, APTypes, Order, Template, Utils } from '../src';

// // @ts-ignore
// import DefaultTerms from './DefaultTerms.json';


// export async function getDefaultTerms (): Promise<APTypes.Terms> {
//   const web3 = new Web3(new Web3.providers.WebsocketProvider('http://localhost:8545'));
//   const account = (await web3.eth.getAccounts())[0];

//   let sampleToken = new web3.eth.Contract(SettlementToken.abi);
//   sampleToken = await sampleToken.deploy({ data: SettlementToken.bytecode }).send({ from: account, gas: 2000000 });

//   const terms: APTypes.Terms = DefaultTerms;
//   terms.currency = sampleToken.options.address;
//   terms.settlementCurrency = sampleToken.options.address;

//   return terms;
// }

// export async function jumpToBlockTime (blockTimestamp: string | number): Promise<void> {
//   const web3 = new Web3(new Web3.providers.WebsocketProvider('http://localhost:8545'));

//   return new Promise((resolve, reject): void =>  {
//     // @ts-ignore
//     web3.currentProvider.send({ 
//       jsonrpc: '2.0', 
//       method: 'evm_mine', 
//       params: [String(blockTimestamp)], 
//       id: new Date().getSeconds()
//     }, async (err: any, res: any): Promise<void> => {
//       // console.log('res: ' + JSON.stringify(res), 'error: ' + JSON.stringify(err));
//       if (err) { reject(err); }
//       return resolve(res);
//     });
//   });
// }
