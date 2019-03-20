const router = require('express').Router()
const fs = require('fs')

const PATH_TO_DATABASE = './Channel-Database.json'

const { hashObject } = require('../services/ethereum')

router.get('/contracts', async (req, res) => {
  const address = req.query.address
  let contractUpdates

  try { contractUpdates = await getContractUpdates(address) } catch (error) {
    if (
      String(error).includes('Error: Error: ENOENT: no such file or directory') ||
      String(error).includes('SyntaxError: Unexpected end of JSON input')
    ) {
      return res.status(404).end()
    } else {
      return res.status(500).end()
    }
  }

  res.status(200).send(JSON.stringify(contractUpdates))
  res.end()
})

router.post('/contracts', async (req, res) => {
	const signedContractUpdate = req.body.signedContractUpdate

  try { await saveContractUpdate(signedContractUpdate) } catch (error) {
    console.error(error)
    return res.status(500).end()
  }

  res.status(200).end()
})

async function getAllContractUpdates () {
  return new Promise((resolve, reject) => {
    fs.readFile(PATH_TO_DATABASE, (error, result) => {
      try {
        if (error) { throw new Error(error) }
        const json = JSON.parse(result.toString('utf8'))
        if (json == null) { throw new Error() }
        resolve(json)
      } catch (error) { return reject(error) }
    })
  })
}

async function getContractUpdates (address) {
  const entries = await getAllContractUpdates()
  return entries[address]
}

async function saveContractUpdate (signedContractUpdate) {
  const signedContractUpdateHash = hashObject(signedContractUpdate)
  const data = { [signedContractUpdateHash]: signedContractUpdate }
  let entries = {}
  try { entries = await getAllContractUpdates() } catch (error) {}

  if (entries[signedContractUpdate.contractUpdate.recordCreatorObligorAddress]) {
    entries[signedContractUpdate.contractUpdate.recordCreatorObligorAddress] = { ...entries[signedContractUpdate.contractUpdate.recordCreatorObligorAddress], ...data }
  } else {
    entries[signedContractUpdate.contractUpdate.recordCreatorObligorAddress] = { ...data }
  }

  if (entries[signedContractUpdate.contractUpdate.counterpartyObligorAddress]) {
    entries[signedContractUpdate.contractUpdate.counterpartyObligorAddress] = { ...entries[signedContractUpdate.contractUpdate.counterpartyObligorAddress], ...data }
  } else {
    entries[signedContractUpdate.contractUpdate.counterpartyObligorAddress] = { ...data }
  }

  return new Promise((resolve, reject) => {
    fs.writeFile(PATH_TO_DATABASE, JSON.stringify(entries, null, 2), 'utf8', (error) => {
      if (error) { return reject(error) }
      resolve()
    })
  })
}

module.exports = router
