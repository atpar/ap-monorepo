const Web3 = require('web3')
const { AP, Asset } = require('@atpar/ap.js')

const AssetIssuerArtifact = require('../../ap-contracts/build/contracts/AssetIssuer.json')

const state = { 
  web3: null,
  assetIssuer: null,
  ap: null
}

async function initialize () {
  state.web3 = new Web3('ws://127.0.01:8545')
  state.ap = await AP.init(state.web3, await getAccount(), {})

  const chainId = await state.web3.eth.net.getId()
  if (!AssetIssuerArtifact['networks'][chainId]) {
    throw(new Error('INITIALIZATION_ERROR: Contracts are not found on network!'))
  }
  const assetIssuerAddress = AssetIssuerArtifact['networks'][chainId].address

  state.assetIssuer = new state.web3.eth.Contract(AssetIssuerArtifact.abi, assetIssuerAddress)
}

function hashObject (object) {
  return state.web3.utils.keccak256(JSON.stringify(object))
} 

async function getAccount () {
  return (await state.web3.eth.getAccounts())[0]
}

async function getPrecision () {
  return Number(await state.assetIssuer.methods.PRECISION.call())
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
  const account = await getAccount()

  const order = {
    maker: orderData.makerAddress,
    taker: orderData.takerAddress,
    actor: orderData.actorAddress,
    terms: orderData.terms,
    makerCreditEnhancement: orderData.makerCreditEnhancementAddress,
    takerCreditEnhancement: orderData.takerCreditEnhancementAddress,
    salt: orderData.salt
  }

  try {
    await state.assetIssuer.methods.fillOrder(
      order,
      orderData.signatures.makerSignature,
      orderData.signatures.takerSignature
    ).send({ from: account, gas: 3000000 })
  } catch (error) {
    const assetId = state.web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        ['bytes', 'bytes'],
        [orderData.signatures.makerSignature, orderData.signatures.takerSignature]
      )
    )
    const event = await state.assetIssuer.getPastEvents('AssetIssued', {
      filter: { assetId: assetId },
      fromBlock: 0,
      toBlock: 'latest'
    })

    if (event.length === 0) {
      throw(new Error('TRANSACTION_ERROR: Transaction failed!'))
    }
  }
}

async function progressAsset (assetId, timestamp) {
  const asset = await Asset.load(state.ap, assetId);

  asset.progress(timestamp, { from: await getAccount() })
}

module.exports = { initialize, hashObject, sendEther, getPrecision, fillOrder, progressAsset }
