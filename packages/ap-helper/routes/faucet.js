const router = require('express').Router()
const sendEther = require('../services/ethereum').sendEther

router.post('/faucet', async (req, res) => {
  const receiver = req.body.address
  
  if (!receiver) { return res.status(400).end() }
  
  try {
    await sendEther(receiver)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }

  console.log('FAUCET: Sent ether.')

  res.status(200).end()
})

module.exports = router
