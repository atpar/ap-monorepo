const ANNEngine = artifacts.require('ANNEngine');
const CECEngine = artifacts.require('CECEngine');
const CEGEngine = artifacts.require('CEGEngine');
const CERTFEngine = artifacts.require('CERTFEngine');
const PAMEngine = artifacts.require('PAMEngine');
const TestCore = artifacts.require('TestCore');


module.exports = async () => {
  const ANNEngineInstance = await ANNEngine.new();
  ANNEngine.setAsDeployed(ANNEngineInstance);
  const CECEngineInstance = await CECEngine.new();
  CECEngine.setAsDeployed(CECEngineInstance);
  const CEGEngineInstance = await CEGEngine.new();
  CEGEngine.setAsDeployed(CEGEngineInstance);
  const CERTFEngineInstance = await CERTFEngine.new();
  CERTFEngine.setAsDeployed(CERTFEngineInstance);
  const PAMEngineInstance = await PAMEngine.new();
  PAMEngine.setAsDeployed(PAMEngineInstance);
  const TestCoreInstance = await TestCore.new();
  TestCore.setAsDeployed(TestCoreInstance);
}
