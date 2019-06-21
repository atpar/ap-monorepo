const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('Orderbook-Database.json')
const db = low(adapter)


db.defaults({ orders: [] }).write()

function getUnfilledOrders () {
  return db.get('orders').map('order').value()
}

function storeUnfilledOrder (order) {
  const id = order['signatures']['makerSignature']

  if (db.get('orders').find({ id }).value()) {
    throw(new Error('Unfilled order already exists!'))
  }

  db.get('orders').push({ id, order }).write()
}

function removeUnfilledOrder (order) {
  const id = order['signatures']['makerSignature']

  db.get('orders').remove({ id }).write()
}

function isFilledOrder (orderData) {
  if (orderData['signatures']['makerSignature'] && orderData['signatures']['takerSignature']) {
    return true
  }

  return false
}

function assertOrderData (orderData) {
  if (!orderData) { return false }
  if (!orderData['makerAddress'] || !orderData['actorAddress']) { return  false }
  if (!orderData['terms']) { return false }
  if (!orderData['makerCreditEnhancementAddress']) { return false }
  if (!orderData['takerAddress'] !== !orderData['takerCreditEnhancementAddress']) { return false }
  if (!orderData['salt']) { return false}
  if (!orderData['takerAddress'] !== !orderData['signatures']['takerSignature']) { return false }
  if (!orderData['signatures']['makerSignature']) { return false }
  
  return true
}


module.exports = { 
  assertOrderData,
  getUnfilledOrders,
  isFilledOrder,
  storeUnfilledOrder,
  removeUnfilledOrder
}
