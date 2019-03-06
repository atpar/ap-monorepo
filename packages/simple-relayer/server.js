const app = require('express')()
const cors = require('cors')
const bodyParser = require('body-parser')
const fs = require('fs')
const Web3 = require('web3')

const PAMTestTerms = '../afp-contracts/test/contract-templates/pam-test-terms.csv'
const parseContractTerms = require('../afp-contracts/test/parser.js').parseContractTerms
const PATH_TO_DATABASE = './Database.json'

const state = { web3: null }

app.use(cors({ origin: '*', credentials: true }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.listen(9000, () => {
  console.log('Server listening on port 9000!')
  state.web3 = new Web3('ws://127.0.01:8545')
})

// /terms?precision=18
app.get('/api/terms', async (req, res) => {
  const precision = Number(req.query.precision)
  try {
    const parsedContractTerms = await parseContractTerms(PAMTestTerms, precision)
    return res.send(parsedContractTerms).status(200)
  } catch (error) {
    return res.status(500).end()
  }
})

app.post('/api/faucet', async (req, res) => {
  const receiver = req.query.address
  const account = (await state.web3.eth.getAccounts())[0]
  try {
    await state.web3.eth.sendTransaction({
      from: account,
      to: receiver,
      value: '7000000000000000000000'
    })
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
  res.status(200).end()
})

app.get('/api/contracts', async (req, res) => {
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

app.post('/api/contracts', async (req, res) => {
  console.log(req.body)
	const signedContractUpdate = req.body.signedContractUpdate

  try { await saveContractUpdate(signedContractUpdate) } catch (error) {
    console.error(error)
    return res.status(500).end()
  }

  res.status(200).end()
})

const getAllContractUpdates = () => {
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

const getContractUpdates = async (address) => {
  const entries = await getAllContractUpdates()
  return entries[address]
}

const saveContractUpdate = async (signedContractUpdate) => {
  const signedContractUpdateHash = state.web3.utils.keccak256(JSON.stringify(signedContractUpdate))
  const data = { [signedContractUpdateHash]: signedContractUpdate }
  let entries = {}
  try { entries = await getAllContractUpdates() } catch (error) { console.error(error) }

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

process.on('uncaughtException', (err) => console.log(err))
