const PAMEngine = artifacts.require('PAMEngine')
const AFPFloatMath = artifacts.require('AFPFloatMath')

const OwnershipRegistry = artifacts.require('OwnershipRegistry')
const ContractRegistry = artifacts.require('ContractRegistry')
const PaymentRegistry = artifacts.require('PaymentRegistry')
const PaymentRouter = artifacts.require('PaymentRouter')

const PAMContractActor = artifacts.require('PAMContractActor')

// const ClaimsTokenETH = artifacts.require('ClaimsTokenETH')
// const ClaimsTokenERC20 = artifacts.require('ClaimsTokenERC20')
// const ClaimsTokenMulti = artifacts.require('ClaimsTokenMulti')
// const ClaimsTokenETHExtension = artifacts.require('ClaimsTokenETHExtension')
// const ClaimsTokenERC20Extension = artifacts.require('ClaimsTokenERC20Extension')
// const ClaimsTokenMultiExtension = artifacts.require('ClaimsTokenMultiExtension')

// const ERC223SampleToken = artifacts.require('ERC223SampleToken')


module.exports = async (deployer, network, accounts) => {

  // AFPCore
  await deployer.deploy(AFPFloatMath)
  await deployer.link(AFPFloatMath, PAMEngine)
  await deployer.deploy(PAMEngine)

  // AFPExtended
  await deployer.deploy(OwnershipRegistry)  
  await deployer.deploy(ContractRegistry)
  const PaymentRegistryInstance = await deployer.deploy(PaymentRegistry)
  await deployer.deploy(
    PaymentRouter, 
    OwnershipRegistry.address, 
    PaymentRegistry.address
  )
  await PaymentRegistryInstance.setPaymentRouter(PaymentRouter.address)

  // Contract Actor
  await deployer.deploy(
    PAMContractActor,
    OwnershipRegistry.address,
    ContractRegistry.address,
    PaymentRegistry.address,
    PaymentRouter.address,
    PAMEngine.address
  )

  // Tokenization / Claims Token
  // await deployer.deploy(ERC223SampleToken)
  // await deployer.deploy(ClaimsTokenETH, accounts[0])
  // await deployer.deploy(ClaimsTokenERC20, accounts[0], ERC223SampleToken.address)
  // await deployer.deploy(ClaimsTokenMulti, accounts[0], ERC223SampleToken.address)
  // await deployer.deploy(ClaimsTokenETHExtension, accounts[0])
  // await deployer.deploy(ClaimsTokenERC20Extension, accounts[0], ERC223SampleToken.address)
  // await deployer.deploy(ClaimsTokenMultiExtension, accounts[0], ERC223SampleToken.address)
}
