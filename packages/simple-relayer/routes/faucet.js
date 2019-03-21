const router = require('express').Router()
const sendEther = require('../services/ethereum').sendEther

router.post('/faucet', async (req, res) => {
  const receiver = req.query.address
  
  try {
    await sendEther(receiver)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }

  res.status(200).end()
})

module.exports = router
