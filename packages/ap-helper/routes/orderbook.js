const router = require('express').Router()
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('Orderbook-Database.json')
const db = low(adapter)

const { fillOrder } = require('../services/ethereum')


db.defaults({ orders: [] }).write()

router.post('/orders', async (req, res) => {
  const orderData = req.body.order
  
  if (!assertOrderData(orderData)) { return res.status(400).end() }
  
  // check if unfilled or filled order
  if (orderData['signatures']['makerSignature'] && orderData['signatures']['takerSignature']) {
    try { await fillOrder(orderData) } catch (error) { 
      console.error(error)
      return res.status(500).end()
    }
    console.log('ORDERBOOK: Filled order.')
    if (removeUnfilledOrder(orderData)) { console.error() }
  } else {
    try { saveUnfilledOrder(orderData) } catch (error) {
      console.error('ORDERBOOK: Could not store unfilled order.', error)
      return res.status(500).end()
    }
    console.log('ORDERBOOK: Stored unfilled order.')
  }

  res.status(200).end()
})

router.get('/orders', async (req, res) => {
  const orders = getUnfilledOrders()

  res.status(200).send(JSON.stringify(orders))
  res.end()
})

function getUnfilledOrders () {
  return db.get('orders').map('order').value()
}

function saveUnfilledOrder (order) {
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


module.exports = router
