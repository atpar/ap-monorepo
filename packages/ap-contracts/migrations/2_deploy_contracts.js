const PAMEngine = artifacts.require('PAMEngine')
const FloatMath = artifacts.require('FloatMath')

const OwnershipRegistry = artifacts.require('OwnershipRegistry')
const EconomicsRegistry = artifacts.require('EconomicsRegistry')
const PaymentRegistry = artifacts.require('PaymentRegistry')
const PaymentRouter = artifacts.require('PaymentRouter')

const AssetActor = artifacts.require('AssetActor')
const AssetIssuer = artifacts.require('AssetIssuer')


module.exports = async (deployer, network, accounts) => {

  // ACTUS-Solidity
  await deployer.deploy(FloatMath)
  await deployer.link(FloatMath, PAMEngine)
  await deployer.deploy(PAMEngine)

  // Core
  await deployer.deploy(OwnershipRegistry)  
  await deployer.deploy(EconomicsRegistry)
  const PaymentRegistryInstance = await deployer.deploy(PaymentRegistry)
  await deployer.deploy(
    PaymentRouter, 
    OwnershipRegistry.address, 
    PaymentRegistry.address
  )
  await PaymentRegistryInstance.setPaymentRouter(PaymentRouter.address)  
  
  // Core: Asset Actor
  await deployer.deploy(
    AssetActor,
    OwnershipRegistry.address,
    EconomicsRegistry.address,
    PaymentRegistry.address,
    PaymentRouter.address,
    PAMEngine.address
  )

  // Issuance
  await deployer.deploy(AssetIssuer)

  // await AssetActorInstance.registerIssuer(AssetIssuer.address)
}
