const ANNEngine = artifacts.require('ANNEngine');
const PAMEngine = artifacts.require('PAMEngine');
const CEGEngine = artifacts.require('CEGEngine');
const CECEngine = artifacts.require('CECEngine');
const SignedMath = artifacts.require('SignedMath');

const MarketObjectRegistry = artifacts.require('MarketObjectRegistry');
const AssetRegistry = artifacts.require('AssetRegistry');
const ProductRegistry = artifacts.require('ProductRegistry');

const AssetActor = artifacts.require('AssetActor');
const AssetIssuer = artifacts.require('AssetIssuer');
const Custodian = artifacts.require('Custodian');

const TokenizationFactory = artifacts.require('TokenizationFactory');


module.exports = async (deployer, network, accounts) => {
  // ACTUS-Solidity
  await deployer.deploy(SignedMath);
  await deployer.link(SignedMath, PAMEngine);
  await deployer.deploy(PAMEngine);
  await deployer.link(SignedMath, ANNEngine);
  await deployer.deploy(ANNEngine);
  await deployer.link(SignedMath, CEGEngine);
  await deployer.deploy(CEGEngine);
  await deployer.link(SignedMath, CECEngine);
  await deployer.deploy(CECEngine);

  // Core
  await deployer.deploy(MarketObjectRegistry);
  await deployer.deploy(ProductRegistry);
  await deployer.deploy(
    AssetRegistry,
    ProductRegistry.address
  );
  const AssetActorInstance = await deployer.deploy(
    AssetActor,
    AssetRegistry.address,
    ProductRegistry.address,
    MarketObjectRegistry.address
  );
  await deployer.deploy(
    Custodian,
    AssetActor.address,
    AssetRegistry.address
  );

  // Issuance
  await deployer.deploy(
    AssetIssuer,
    Custodian.address,
    ProductRegistry.address,
    AssetRegistry.address
  );

  // Tokenization
  await deployer.deploy(
    TokenizationFactory,
    AssetRegistry.address
  );

  await AssetActorInstance.registerIssuer(AssetIssuer.address);

  console.log(`
    Deployments:
    
      ANNEngine: ${ANNEngine.address}
      AssetActor: ${AssetActor.address}
      AssetIssuer: ${AssetIssuer.address}
      AssetRegistry: ${AssetRegistry.address}
      CECEngine: ${CECEngine.address}
      CEGEngine: ${CEGEngine.address}
      Custodian: ${Custodian.address}
      MarketObjectRegistry: ${MarketObjectRegistry.address}
      PAMEngine: ${PAMEngine.address}
      ProductRegistry: ${ProductRegistry.address}
      SignedMath: ${SignedMath.address}
      TokenizationFactory: ${TokenizationFactory.address}
  `);
};
