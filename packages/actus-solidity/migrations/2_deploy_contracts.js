const ANNEngine = artifacts.require('ANNEngine');
const CECEngine = artifacts.require('CECEngine');
const CEGEngine = artifacts.require('CEGEngine');
const CERTFEngine = artifacts.require('CERTFEngine');
const PAMEngine = artifacts.require('PAMEngine');


module.exports = async (deployer) => {
  await deployer.deploy(ANNEngine);
  await deployer.deploy(CECEngine);
  await deployer.deploy(CEGEngine);
  await deployer.deploy(CERTFEngine);
  await deployer.deploy(PAMEngine);

  console.log(`
    Deployments:
    
      ANNEngine: ${ANNEngine.address}
      CECEngine: ${CECEngine.address}
      CEGEngine: ${CEGEngine.address}
      CERTFEngine: ${CERTFEngine.address}
      PAMEngine: ${PAMEngine.address}
  `);
}
