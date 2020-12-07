require('dotenv').config({ path: __dirname })

const crypto = require('crypto');
const fetch = require('node-fetch');

const apiRoot = 'https://api.pro.coinbase.com'

const getCBData = async ({cbAccessKey, cbAccessSecret, cbPassphrase}) => {

    const timestamp = Date.now() / 1000;
    const requestPath = '/oracle';
    const method = 'GET';
    const what = timestamp + method + requestPath;
    const key = Buffer.from(cbAccessSecret, 'base64');
    const hmac = crypto.createHmac('sha256', key);
    const cbAccessSign = hmac.update(what).digest('base64');

    const result = await fetch(`${apiRoot}${requestPath}`, {
        method: 'GET',
        headers: { 
            'CB-ACCESS-KEY': cbAccessKey,
            'CB-ACCESS-SIGN': cbAccessSign,
            'CB-ACCESS-TIMESTAMP': timestamp,
            'CB-ACCESS-PASSPHRASE': cbPassphrase
        }
    })

    const jsonResult = await result.json()
    return jsonResult
}

const getCoinbaseData = async (web3, key) => {
    const config = require('./env.config')
    const data = await getCBData(config);

    for (let i = 0; i < data.messages.length; i++) {
        const message = data.messages[i];
        const signature = data.signatures[i];
        const params = web3.eth.abi.decodeParameters(['string', 'uint64', 'string', 'uint64'], message);
        if (params[2] === key) {
            return { message, signature, decoded: params }
        }
        
    }
}

module.exports = {
    getCoinbaseData
}