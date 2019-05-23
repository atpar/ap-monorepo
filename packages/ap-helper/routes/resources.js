const router = require('express').Router()

const terms = {
  '10001': require('actus-solidity/actus-resources/test-terms/Test-PAM-10001.json'),
  '10002': require('actus-solidity/actus-resources/test-terms/Test-PAM-10002.json'),
  '10004': require('actus-solidity/actus-resources/test-terms/Test-PAM-10004.json'),
  '10016': require('actus-solidity/actus-resources/test-terms/Test-PAM-10016.json'),
  '10017': require('actus-solidity/actus-resources/test-terms/Test-PAM-10017.json'),
  '10018': require('actus-solidity/actus-resources/test-terms/Test-PAM-10018.json'),
  '10018': require('actus-solidity/actus-resources/test-terms/Test-PAM-10019.json')
}


router.get('/terms', async (req, res) => {
  try {
    return res.send(terms).status(200)
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
})

module.exports = router
