const Web3 = require('web3')
const { AP, Asset } = require('@atpar/ap.js')

const state = { 
  web3: null,
  assetIssuer: null,
  ap: null
}

async function initialize () {
  state.web3 = new Web3('ws://127.0.01:8545')
  state.ap = await AP.init(state.web3, await getAccount(), {})
}

async function sendEther (receiver) {
  const account = await getAccount()

  return await state.web3.eth.sendTransaction({
    from: account,
    to: receiver,
    value: '10000000000000000000000'
  })
}

async function fillOrder (orderData) {
  try {
    await state.ap.issuance.fillOrder(orderData).send({ from: await getAccount(), gas: 3000000 })
  } catch {
    throw(new Error('TRANSACTION_ERROR: Transaction failed!'))
  }
}

async function progressAsset (assetId, timestamp) {
  const asset = await Asset.load(state.ap, assetId)

  asset.progress(timestamp, { from: await getAccount() })
}

const hashObject = async (object) => state.web3.utils.keccak256(JSON.stringify(object)) 

const getAccount = async () => (await state.web3.eth.getAccounts())[0]


module.exports = { initialize, hashObject, sendEther, fillOrder, progressAsset }
