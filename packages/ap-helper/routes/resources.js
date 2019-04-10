const router = require('express').Router()
const { parseTermsFromCSVString } = require('@atpar/ap-contracts/actus-resources/parser')
const PAMTestTermsAsCSVString = require('@atpar/ap-contracts/actus-resources/test-terms/pam-test-terms-covered.csv').default

router.get('/terms', async (req, res) => {
  try {
    const parsedTerms = await parseTermsFromCSVString(PAMTestTermsAsCSVString)
    return res.send(parsedTerms).status(200)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
})

module.exports = router
