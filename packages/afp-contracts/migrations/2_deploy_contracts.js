const PAMStatelessContract = artifacts.require('PAMStatelessContract')
const AFPFloatMath = artifacts.require('AFPFloatMath')

module.exports = async (deployer) => {
  await deployer.deploy(AFPFloatMath)
  await deployer.link(AFPFloatMath, PAMStatelessContract)
  await deployer.deploy(PAMStatelessContract)
}
