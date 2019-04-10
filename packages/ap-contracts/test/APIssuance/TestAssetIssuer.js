const { expectEvent } = require('openzeppelin-test-helpers');


const AssetIssuer = artifacts.require('AssetIssuer.sol')
const PAMEngine = artifacts.require('PAMEngine.sol')
const PAMAssetActor = artifacts.require('PAMAssetActor')
const EconomicsRegistry = artifacts.require('EconomicsRegistry')
const OwnershipRegistry = artifacts.require('OwnershipRegistry')

const { parseTermsFromPath } = require('../parser.js')
const PAMTestTermsPath = './test/contract-templates/pam-test-terms.csv'

const getTerms = () => parseTermsFromPath(PAMTestTermsPath)


contract('AssetIssuer', (accounts) => {

  const recordCreator = accounts[0]
  const counterparty = accounts[1]

  before(async () => {
    PAMEngine.numberFormat = 'String'
    const PAMEngineInstance = await PAMEngine.new()

    ;({ '10001': this.terms } = await getTerms())
    this.state = await PAMEngineInstance.computeInitialState(this.terms, {})

    this.EconomicsRegistryInstance = await EconomicsRegistry.deployed()
    this.OwnershipRegistryInstance = await OwnershipRegistry.deployed()
    this.PAMAssetActorInstance = await PAMAssetActor.deployed()
    this.AssetIssuerInstance = await AssetIssuer.new()
  })

  it('should issue an asset from an order', async () => {
    const orderData = { 
      makerAddress: recordCreator,
      takerAddress: counterparty,
      actorAddress: this.PAMAssetActorInstance.address,
      terms: this.terms,
      makerCreditEnhancementAddress: '0x0000000000000000000000000000000000000000',
      takerCreditEnhancementAddress: '0x0000000000000000000000000000000000000000',
      signatures: { 
        makerSignature: null,
        takerSignature: null 
      },
      salt: Math.floor(Math.random() * 1000000) 
    }

    const unfilledOrderAsTypedData = getUnfilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address)
    const filledOrderAsTypedData = getFilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address)

    orderData.signatures.makerSignature = await sign(unfilledOrderAsTypedData, recordCreator)
    orderData.signatures.takerSignature = await sign(filledOrderAsTypedData, counterparty)

    const order = {
      maker: orderData.makerAddress,
      taker: orderData.takerAddress,
      actor: orderData.actorAddress,
      terms: orderData.terms,
      makerCreditEnhancement: orderData.makerCreditEnhancementAddress,
      takerCreditEnhancement: orderData.takerCreditEnhancementAddress,
      salt: orderData.salt
    }

    const { tx: txHash } = await this.AssetIssuerInstance.fillOrder(
      order,
      orderData.signatures.makerSignature,
      orderData.signatures.takerSignature
    )

    const assetId = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        ['bytes', 'bytes'],
        [orderData.signatures.makerSignature, orderData.signatures.takerSignature]
      )
    )

    const storedTerms = await this.EconomicsRegistryInstance.getTerms(assetId)
    const storedOwnership = await this.OwnershipRegistryInstance.getOwnership(assetId)

    assert.equal(storedTerms['statusDate'], orderData.terms['statusDate'])
    assert.equal(storedOwnership[0], recordCreator)
    assert.equal(storedOwnership[1], recordCreator)
    assert.equal(storedOwnership[2], counterparty)
    assert.equal(storedOwnership[3], counterparty)

    await expectEvent.inTransaction(txHash, AssetIssuer, 'AssetIssued', {
      assetId: assetId,
      recordCreator: recordCreator,
      counterparty: counterparty
    })
  })
})

const sign = (typedData, account) => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      method: 'eth_signTypedData',
      params: [account, typedData],
      from: account,
      id: new Date().getSeconds()
    }, (error, result) => {
      if (error) { return reject(error) }
      resolve(result.result)
    })
  })
}

const getUnfilledOrderDataAsTypedData = (orderData, verifyingContractAddress) => {
  const verifyingContract = verifyingContractAddress

  // todo: add to solidity ContractTerms struct
  delete orderData.terms.contractType

  const contractTermsHash = web3.utils.keccak256(web3.eth.abi.encodeParameter(
    ContractTermsABI, _toTuple(orderData.terms)
  ))

  const typedData = {
    domain: {
      name: 'ACTUS Protocol',
      version: '1',
      chainId: 0,
      verifyingContract: verifyingContract
    },
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      Order: [
        { name: 'maker', type: 'address' },
        { name: 'actor', type: 'address' },
        { name: 'contractTermsHash', type: 'bytes32' },
        { name: 'makerCreditEnhancement', type: 'address' },
        { name: 'salt', type: 'uint256' }
      ]
    },
    primaryType: 'Order',
    message: {
      maker: orderData.makerAddress,
      actor: orderData.actorAddress,
      contractTermsHash: contractTermsHash,
      makerCreditEnhancement: orderData.makerCreditEnhancementAddress,
      salt: orderData.salt
    }
  }

  return typedData
}

const getFilledOrderDataAsTypedData = (orderData, verifyingContractAddress) => {
  const verifyingContract = verifyingContractAddress

  // todo: add to solidity ContractTerms struct
  delete orderData.terms.contractType

  const contractTermsHash = web3.utils.keccak256(web3.eth.abi.encodeParameter(
    ContractTermsABI, _toTuple(orderData.terms)
  ))

  const typedData = {
    domain: {
      name: 'ACTUS Protocol',
      version: '1',
      chainId: 0,
      verifyingContract: verifyingContract
    },
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      Order: [
        { name: 'maker', type: 'address' },
        { name: 'taker', type: 'address' },
        { name: 'actor', type: 'address' },
        { name: 'contractTermsHash', type: 'bytes32' },
        { name: 'makerCreditEnhancement', type: 'address' },
        { name: 'takerCreditEnhancement', type: 'address' },
        { name: 'salt', type: 'uint256' }
      ]
    },
    primaryType: 'Order',
    message: {
      maker: orderData.makerAddress,
      taker: orderData.takerAddress,
      actor: orderData.actorAddress,
      contractTermsHash: contractTermsHash,
      makerCreditEnhancement: orderData.makerCreditEnhancementAddress,
      takerCreditEnhancement: orderData.takerCreditEnhancementAddress,
      salt: orderData.salt
    }
  }

  return typedData
}

const _toTuple = (obj) => {
  if (!(obj instanceof Object)) { return [] }
  var output = []
  var i = 0
  Object.keys(obj).forEach((k) => {
    if (obj[k] instanceof Object) {
      output[i] = _toTuple(obj[k])
    } else if (obj[k] instanceof Array) {
      let j1 = 0
      let temp1 = []
      obj[k].forEach((ak) => {
        temp1[j1] = _toTuple(obj[k])
        j1++
      })
      output[i] = temp1
    } else {
      output[i] = obj[k]
    }
    i++
  })
  return output
}

// @ts-ignore 
const ContractTermsABI = {
  "components": [
    {
      "name": "calendar",
      "type": "uint8"
    },
    {
      "name": "contractRole",
      "type": "uint8"
    },
    {
      "name": "legalEntityIdRecordCreator",
      "type": "string"
    },
    {
      "name": "legalEntityIdCounterparty",
      "type": "string"
    },
    {
      "name": "dayCountConvention",
      "type": "uint8"
    },
    {
      "name": "businessDayConvention",
      "type": "uint8"
    },
    {
      "name": "endOfMonthConvention",
      "type": "uint8"
    },
    {
      "name": "currency",
      "type": "uint8"
    },
    {
      "name": "scalingEffect",
      "type": "uint8"
    },
    {
      "name": "penaltyType",
      "type": "uint8"
    },
    {
      "name": "feeBasis",
      "type": "uint8"
    },
    {
      "name": "statusDate",
      "type": "uint256"
    },
    {
      "name": "initialExchangeDate",
      "type": "uint256"
    },
    {
      "name": "maturityDate",
      "type": "uint256"
    },
    {
      "name": "terminationDate",
      "type": "uint256"
    },
    {
      "name": "purchaseDate",
      "type": "uint256"
    },
    {
      "name": "capitalizationEndDate",
      "type": "uint256"
    },
    {
      "name": "cycleAnchorDateOfInterestPayment",
      "type": "uint256"
    },
    {
      "name": "cycleAnchorDateOfRateReset",
      "type": "uint256"
    },
    {
      "name": "cycleAnchorDateOfScalingIndex",
      "type": "uint256"
    },
    {
      "name": "cycleAnchorDateOfFee",
      "type": "uint256"
    },
    {
      "name": "notionalPrincipal",
      "type": "int256"
    },
    {
      "name": "nominalInterestRate",
      "type": "int256"
    },
    {
      "name": "feeAccrued",
      "type": "int256"
    },
    {
      "name": "accruedInterest",
      "type": "int256"
    },
    {
      "name": "rateMultiplier",
      "type": "int256"
    },
    {
      "name": "rateSpread",
      "type": "int256"
    },
    {
      "name": "feeRate",
      "type": "int256"
    },
    {
      "name": "nextResetRate",
      "type": "int256"
    },
    {
      "name": "penaltyRate",
      "type": "int256"
    },
    {
      "name": "premiumDiscountAtIED",
      "type": "int256"
    },
    {
      "name": "priceAtPurchaseDate",
      "type": "int256"
    },
    {
      "components": [
        {
          "name": "i",
          "type": "uint256"
        },
        {
          "name": "p",
          "type": "uint8"
        },
        {
          "name": "s",
          "type": "uint8"
        },
        {
          "name": "isSet",
          "type": "bool"
        }
      ],
      "name": "cycleOfInterestPayment",
      "type": "tuple"
    },
    {
      "components": [
        {
          "name": "i",
          "type": "uint256"
        },
        {
          "name": "p",
          "type": "uint8"
        },
        {
          "name": "s",
          "type": "uint8"
        },
        {
          "name": "isSet",
          "type": "bool"
        }
      ],
      "name": "cycleOfRateReset",
      "type": "tuple"
    },
    {
      "components": [
        {
          "name": "i",
          "type": "uint256"
        },
        {
          "name": "p",
          "type": "uint8"
        },
        {
          "name": "s",
          "type": "uint8"
        },
        {
          "name": "isSet",
          "type": "bool"
        }
      ],
      "name": "cycleOfScalingIndex",
      "type": "tuple"
    },
    {
      "components": [
        {
          "name": "i",
          "type": "uint256"
        },
        {
          "name": "p",
          "type": "uint8"
        },
        {
          "name": "s",
          "type": "uint8"
        },
        {
          "name": "isSet",
          "type": "bool"
        }
      ],
      "name": "cycleOfFee",
      "type": "tuple"
    },
    {
      "name": "lifeCap",
      "type": "int256"
    },
    {
      "name": "lifePeriod",
      "type": "int256"
    },
    {
      "name": "lifeFloor",
      "type": "int256"
    },
    {
      "name": "periodCap",
      "type": "int256"
    },
    {
      "name": "periodFloor",
      "type": "int256"
    }
  ],
  "name": "terms",
  "type": "tuple"
}
