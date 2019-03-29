const Web3 = require('web3')

const AssetIssuerArtifact = require('../../ap-contracts/build/contracts/AssetIssuer.json')

const state = { 
  web3: null,
  assetIssuer: null
}

async function initialize () {
  state.web3 = new Web3('ws://127.0.01:8545')

  const chainId = await state.web3.eth.net.getId();

  if (!AssetIssuerArtifact['networks'][chainId]) {
    throw(new Error('INITIALIZATION_ERROR: Contracts are not found on network!'))
  }

  const assetIssuerContractAddress = AssetIssuerArtifact['networks'][chainId].address
  
  state.assetIssuer = new state.web3.eth.Contract(AssetIssuerArtifact.abi, assetIssuerContractAddress)
}

function hashObject (object) {
  return state.web3.utils.keccak256(JSON.stringify(object))
} 

async function getAccount () {
  return (await state.web3.eth.getAccounts())[0]
}

async function sendEther () {
  const account = await getAccount()
 
  return await state.web3.eth.sendTransaction({
    from: account,
    to: receiver,
    value: '7000000000000000000000'
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

  await state.assetIssuer.methods.fillOrder(
    order,
    orderData.signatures.makerSignature,
    orderData.signatures.takerSignature
  ).send({ from: account, gas: 3000000 })
}

async function getPrecision () {
  return Number(await state.assetIssuer.methods.PRECISION.call())
}

module.exports = { initialize, hashObject, sendEther, getPrecision, fillOrder }
