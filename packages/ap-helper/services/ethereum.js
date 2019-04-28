const Web3 = require('web3')
const { AP, Asset } = require('@atpar/ap.js')
const ERC20SampleTokenArtifact = require('@atpar/ap-contracts/build/contracts/ERC20SampleToken.json')

const state = { 
  web3: null,
  ap: null,
  sampleTokenInstance: null
}

async function initialize () {
  state.web3 = new Web3('ws://127.0.01:8545')
  state.ap = await AP.init(state.web3, await getAccount(), {})

  state.sampleTokenInstance = new state.web3.eth.Contract(ERC20SampleTokenArtifact.abi)
  const response = await state.sampleTokenInstance.deploy(
    { data: ERC20SampleTokenArtifact.bytecode }
  ).send({ from: await getAccount(), gas: 1000000 })
}

async function sendEther (receiver) {
  const account = await getAccount()

  return await state.web3.eth.sendTransaction({
    from: account,
    to: receiver,
    value: '10000000000000000000000'
  })
}

async function sendSampleToken (receiver) {
  const account = await getAccount()

  return await state.sampleTokenInstance.methods.transfer(
    receiver, 
    '10000000000000000000000'
  ).send({ from: account })
}

function getSampleTokenAddress () {
  if (!state.sampleTokenInstance) { throw(new Error('INITIALIZATION_ERROR: SampleToken contract is not deployed!')) }
  return state.sampleTokenInstance.options.address
}

async function fillOrder (orderData) {
  try {
    await state.ap.issuance.fillOrder(orderData).send({ from: await getAccount(), gas: 3000000 })
  } catch (error) {
    console.error(error)
    throw(new Error('TRANSACTION_ERROR: Could not fill order!'))
  }
}

async function progressAsset (assetId, timestamp) {
  try {
    const asset = await Asset.load(state.ap, assetId)
    await asset.progress(timestamp)
  } catch (error) {
    console.log(error)
  }
}

const hashObject = async (object) => state.web3.utils.keccak256(JSON.stringify(object)) 

const getAccount = async () => (await state.web3.eth.getAccounts())[0]


module.exports = { initialize, hashObject, sendEther, sendSampleToken, getSampleTokenAddress, fillOrder, progressAsset }
