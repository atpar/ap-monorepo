const router = require('express').Router()
const { progressAsset } = require('../services/ethereum')


router.post('/asset/progress', async (req, res) => {
  const { assetId, timestamp } = req.body
  
  if (!assetId || !timestamp) { return res.status(400).end() }
  
  try {
    await progressAsset(assetId, timestamp)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }

  console.log('ASSET: Progressed asset.')

  res.status(200).end()
})

module.exports = router
