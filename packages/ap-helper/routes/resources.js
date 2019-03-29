const router = require('express').Router()

const PAMTestTermsAsCSV = require('../../ap-contracts/test/contract-templates/pam-test-terms.csv').default
const parseContractTerms2 = require('../../ap-contracts/test/parser.js').parseContractTerms2

const { getPrecision } = require('../services/ethereum')


router.get('/terms', async (req, res) => {
  const precision = await getPrecision()

  try {
    const parsedContractTerms = await parseContractTerms2(PAMTestTermsAsCSV, precision)
    return res.send(parsedContractTerms).status(200)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
})

module.exports = router
