const PAMEngine = artifacts.require('PAMEngine');
const ANNEngine = artifacts.require('ANNEngine');
const CEGEngine = artifacts.require('CEGEngine');
const CECEngine = artifacts.require('CECEngine');
const SignedMath = artifacts.require('SignedMath');


module.exports = async (deployer) => {
  await deployer.deploy(SignedMath);
  
  await deployer.link(SignedMath, PAMEngine);
  await deployer.deploy(PAMEngine);

  await deployer.link(SignedMath, ANNEngine);
  await deployer.deploy(ANNEngine);

  await deployer.link(SignedMath, CEGEngine);
  await deployer.deploy(CEGEngine);

  await deployer.link(SignedMath, CECEngine);
  await deployer.deploy(CECEngine);

  console.log(`
    Deployments:
    
      ANNEngine: ${ANNEngine.address}
      CECEngine: ${CECEngine.address}
      CEGEngine: ${CEGEngine.address}
      PAMEngine: ${PAMEngine.address}
      SignedMath: ${SignedMath.address}
  `);
}
