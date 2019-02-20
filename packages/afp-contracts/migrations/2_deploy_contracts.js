const PAMStatelessContract = artifacts.require('PAMStatelessContract')
const AFPFloatMath = artifacts.require('AFPFloatMath')

const OwnershipRegistry = artifacts.require('OwnershipRegistry')
const PaymentRegistry = artifacts.require('PaymentRegistry')
const PaymentRouter = artifacts.require('PaymentRouter')


module.exports = async (deployer) => {
  await deployer.deploy(AFPFloatMath)
  await deployer.link(AFPFloatMath, PAMStatelessContract)
  await deployer.deploy(PAMStatelessContract)

  await deployer.deploy(OwnershipRegistry)  
  await deployer.deploy(PaymentRegistry)
  await deployer.deploy(
    PaymentRouter, 
    OwnershipRegistry.address, 
    PaymentRegistry.address
  )
}
