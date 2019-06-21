const app = require('express')()
const cors = require('cors')
const bodyParser = require('body-parser')


app.use(cors({ origin: '*', credentials: true }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.listen(9000, async () => { 
  await require('./services/ethereum').initialize()

  console.log('Server listening on port 9000!') 
})

app.use('/api', require('./routes/resources'))
app.use('/api', require('./routes/faucet'))
app.use('/api', require('./routes/orderbook'))
app.use('/api', require('./routes/asset'))
app.use('/api', require('./routes/tokenization'))

process.on('uncaughtException', (err) => console.log(err))
