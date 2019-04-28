const router = require('express').Router()
const { sendEther, sendSampleToken, getSampleTokenAddress } = require('../services/ethereum')

router.post('/faucet/ether', async (req, res) => {
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

router.post('/faucet/sampleToken', async (req, res) => {
  const receiver = req.body.address
  
  if (!receiver) { return res.status(400).end() }
  
  try {
    await sendSampleToken(receiver)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }

  console.log('FAUCET: Sent sample tokens.')

  res.status(200).end()
})

router.get('/faucet/sampleToken', async (req, res) => {
  try {
    const address = getSampleTokenAddress()
    res.status(200).send({ address })
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
})

module.exports = router
