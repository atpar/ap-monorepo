const PAMEngine = artifacts.require('PAMEngine')
const AFPFloatMath = artifacts.require('AFPFloatMath')

const OwnershipRegistry = artifacts.require('OwnershipRegistry')
const ContractRegistry = artifacts.require('ContractRegistry')
const PaymentRegistry = artifacts.require('PaymentRegistry')
const PaymentRouter = artifacts.require('PaymentRouter')

const PAMContractActor = artifacts.require('PAMContractActor')
const ClaimsToken = artifacts.require('ClaimsToken')


module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(AFPFloatMath)
  await deployer.link(AFPFloatMath, PAMEngine)
  await deployer.deploy(PAMEngine)

  await deployer.deploy(OwnershipRegistry)  
  await deployer.deploy(ContractRegistry)
  const PaymentRegistryInstance = await deployer.deploy(PaymentRegistry)
  await deployer.deploy(
    PaymentRouter, 
    OwnershipRegistry.address, 
    PaymentRegistry.address
  )
  await PaymentRegistryInstance.setPaymentRouter(PaymentRouter.address)

  await deployer.deploy(ClaimsToken, accounts[0])
  await deployer.deploy(
    PAMContractActor,
    OwnershipRegistry.address,
    ContractRegistry.address,
    PaymentRegistry.address,
    PaymentRouter.address,
    PAMEngine.address
  )
}
