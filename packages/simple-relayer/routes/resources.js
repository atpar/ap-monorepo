const router = require('express').Router()

const PAMTestTermsPath = '../ap-contracts/test/contract-templates/pam-test-terms.csv'
const parseContractTerms = require('../../ap-contracts/test/parser.js').parseContractTerms

const { getPrecision } = require('../services/ethereum')


router.get('/terms', async (req, res) => {
  const precision = await getPrecision()

  try {
    const parsedContractTerms = await parseContractTerms(PAMTestTermsPath, precision)
    return res.send(parsedContractTerms).status(200)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
})

module.exports = router
