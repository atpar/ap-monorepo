const PAMEngine = artifacts.require('PAMEngine');
const ANNEngine = artifacts.require('ANNEngine');
const CEGEngine = artifacts.require('CEGEngine');
const CECEngine = artifacts.require('CECEngine');
const TestCore = artifacts.require('TestCore');
const TestPOF = artifacts.require('TestPOF');
const TestSTF = artifacts.require('TestSTF');
const TestSignedMath = artifacts.require('TestSignedMath');


module.exports = async () => {
  const PAMEngineInstance = await PAMEngine.new();
  PAMEngine.setAsDeployed(PAMEngineInstance);

  const ANNEngineInstance = await ANNEngine.new();
  ANNEngine.setAsDeployed(ANNEngineInstance);

  const CEGEngineInstance = await CEGEngine.new();
  CEGEngine.setAsDeployed(CEGEngineInstance);

  const CECEngineInstance = await CECEngine.new();
  CECEngine.setAsDeployed(CECEngineInstance);

  const TestCoreInstance = await TestCore.new();
  TestCore.setAsDeployed(TestCoreInstance);
  
  const TestPOFInstance = await TestPOF.new();
  TestPOF.setAsDeployed(TestPOFInstance);

  const TestSTFInstance = await TestSTF.new();
  TestSTF.setAsDeployed(TestSTFInstance);

  const TestSignedMathInstance = await TestSignedMath.new();
  TestSignedMath.setAsDeployed(TestSignedMathInstance);
}
