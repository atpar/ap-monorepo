const router = require('express').Router()

const { fillOrder } = require('../services/ethereum')
const { 
  assertOrderData,
  getUnfilledOrders,
  isFilledOrder,
  storeUnfilledOrder,
  removeUnfilledOrder
} = require('../services/orderbook')


router.post('/orders', async (req, res) => {
  const orderData = req.body.order
  
  if (!assertOrderData(orderData)) { 
    return res.status(400).end() 
  }
  
  if (isFilledOrder(orderData)) {
    try { 
      await fillOrder(orderData) 
    } catch (error) { 
      console.error(error)
      return res.status(500).end()
    }
    
    console.log('ORDERBOOK: Filled order.')
    
    if (removeUnfilledOrder(orderData)) { 
      console.error('ORDERBOOK: Could not remove filled order.') 
    }
  } else {
    try { 
      storeUnfilledOrder(orderData) 
    } catch (error) {
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
})


module.exports = router
