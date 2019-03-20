const router = require('express').Router()
const fs = require('fs')

const { fillOrder } = require('../services/ethereum')
const PATH_TO_DATABASE = './Orderbook-Database.json'

router.post('/orders', async (req, res) => {
  const orderData = req.body.order
  
  if (!assertOrderData(orderData)) { return res.status(400).end() }
  
  // check if unfilled or filled order
  if (orderData['signatures']['makerSignature'] && orderData['signatures']['takerSignature']) {
    try { await fillOrder(orderData) } catch (error) { 
      console.error(error)
      return res.status(500).end()
    }
    console.log('filled order')
    try { await removeUnfilledOrder(orderData) } catch (error) { console.error(error) }
  } else {
    try { await saveUnfilledOrder(orderData) } catch (error) {
      console.error(error)
      return res.status(500).end()
    }
    console.log('stored unfilled order')
  }

  res.status(200).end()
})

router.get('/orders', async (req, res) => {
  try { orders = await getUnfilledOrders() } catch (error) {
    if (
      String(error).includes('Error: Error: ENOENT: no such file or directory') ||
      String(error).includes('SyntaxError: Unexpected end of JSON input')
    ) {
      return res.status(404).end()
    } else {
      return res.status(500).end()
    }
  }

  res.status(200).send(JSON.stringify(orders))
  res.end()
})

async function getUnfilledOrders () {
  return new Promise((resolve, reject) => {
    fs.readFile(PATH_TO_DATABASE, (error, result) => {
      try {
        if (error) { throw new Error(error) }
        const json = JSON.parse(result.toString('utf8'))
        if (json == null) { throw new Error() }
        resolve(json)
      } catch (error) { return reject(error) }
    })
  })
}

async function saveUnfilledOrder (order) {
  const identifier = order['signatures']['makerSignature']
  const data = { [identifier]: order }

  // catch if file does not exist
  let entries = {}
  try { entries = await getUnfilledOrders() } catch (error) {}

  if (entries[identifier]) { throw(new Error('Unfilled order already exists!')) }

  entries = { ...entries, ...data }

  return new Promise((resolve, reject) => {
    fs.writeFile(PATH_TO_DATABASE, JSON.stringify(entries, null, 2), 'utf8', (error) => {
      if (error) { return reject(error) }
      resolve()
    })
  })
}

async function removeUnfilledOrder (order) {
  const identifier = order['signatures']['makerSignature']
  const entries = await getUnfilledOrders()
  delete entries[identifier]

  return new Promise((resolve, reject) => {
    fs.writeFile(PATH_TO_DATABASE, JSON.stringify(entries, null, 2), 'utf8', (error) => {
      if (error) { return reject(error) }
      resolve()
    })
  })
}

function assertOrderData (orderData) {
  if (!orderData) { return false }
  if (!orderData['signatures']['makerSignature']) { return false }
  if (!orderData['makerAddress']  || !orderData['takerAddress'] || !orderData['actorAddress']) { return  false }
  if (!orderData['terms']) { return false }
  if (!orderData['makerCreditEnhancementAddress'] || !orderData['takerCreditEnhancementAddress']) { return false }
  if (!orderData['salt']) { return false}
  return true
}


module.exports = router
