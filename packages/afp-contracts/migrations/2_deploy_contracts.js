const PAMStatelessContract = artifacts.require('PAMStatelessContract')
const AFPFloatMath = artifacts.require('AFPFloatMath')

const OwnershipRegistry = artifacts.require('OwnershipRegistry')
const ContractRegistry = artifacts.require('ContractRegistry')
const PaymentRegistry = artifacts.require('PaymentRegistry')
const PaymentRouter = artifacts.require('PaymentRouter')

const ClaimsToken = artifacts.require('ClaimsToken')


module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(AFPFloatMath)
  await deployer.link(AFPFloatMath, PAMStatelessContract)
  await deployer.deploy(PAMStatelessContract)

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
}
