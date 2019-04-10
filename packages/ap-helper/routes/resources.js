const router = require('express').Router()

const PAMTestTermsAsCSVString = require('../../ap-contracts/test/contract-templates/pam-test-terms.csv').default
const { parseTermsFromCSVString } = require('../../ap-contracts/test/parser.js')


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
