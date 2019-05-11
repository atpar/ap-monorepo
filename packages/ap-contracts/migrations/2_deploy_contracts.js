const PAMEngine = artifacts.require('PAMEngine')
const APFloatMath = artifacts.require('APFloatMath')

const OwnershipRegistry = artifacts.require('OwnershipRegistry')
const EconomicsRegistry = artifacts.require('EconomicsRegistry')
const PaymentRegistry = artifacts.require('PaymentRegistry')
const PaymentRouter = artifacts.require('PaymentRouter')

const AssetActor = artifacts.require('AssetActor')

const AssetIssuer = artifacts.require('AssetIssuer')


module.exports = async (deployer, network, accounts) => {

  // APCore
  await deployer.deploy(APFloatMath)
  await deployer.link(APFloatMath, PAMEngine)
  await deployer.deploy(PAMEngine)

  // APExtended
  await deployer.deploy(OwnershipRegistry)  
  await deployer.deploy(EconomicsRegistry)
  const PaymentRegistryInstance = await deployer.deploy(PaymentRegistry)
  await deployer.deploy(
    PaymentRouter, 
    OwnershipRegistry.address, 
    PaymentRegistry.address
  )
  await PaymentRegistryInstance.setPaymentRouter(PaymentRouter.address)  

  // Exchange
  await deployer.deploy(AssetIssuer)

  // Asset Actor
  await deployer.deploy(
    AssetActor,
    OwnershipRegistry.address,
    EconomicsRegistry.address,
    PaymentRegistry.address,
    PaymentRouter.address,
    PAMEngine.address
  )
  // await AssetActorInstance.registerIssuer(AssetIssuer.address)
}
