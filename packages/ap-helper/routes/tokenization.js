const router = require('express').Router()
const { updateClaimsToken } = require('../services/ethereum')


router.post('/tokenization/updateClaimsToken', async (req, res) => {
  const { address } = req.body
  
  if (!address) { return res.status(400).end() }
  
  try {
    await updateClaimsToken(address)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }

  console.log('Tokenization: Updated ClaimsToken.')

  res.status(200).end()
})

module.exports = router
