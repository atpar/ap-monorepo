const ANNEngine = artifacts.require('ANNEngine');
const PAMEngine = artifacts.require('PAMEngine');
// const CEGEngine = artifacts.require('CEGEngine');
const SignedMath = artifacts.require('SignedMath');

const AssetRegistry = artifacts.require('AssetRegistry');
const ProductRegistry = artifacts.require('ProductRegistry');

const AssetActor = artifacts.require('AssetActor');
const AssetIssuer = artifacts.require('AssetIssuer');

const TokenizationFactory = artifacts.require('TokenizationFactory');


module.exports = async (deployer, network, accounts) => {
  // ACTUS-Solidity
  await deployer.deploy(SignedMath);
  await deployer.link(SignedMath, PAMEngine);
  await deployer.deploy(PAMEngine);
  await deployer.link(SignedMath, ANNEngine);
  await deployer.deploy(ANNEngine);
  // await deployer.link(SignedMath, CEGEngine);
  // await deployer.deploy(CEGEngine);

  // Core
  await deployer.deploy(ProductRegistry);
  await deployer.deploy(
    AssetRegistry,
    ProductRegistry.address
  );
  
  // Core: Asset Actor
  const AssetActorInstance = await deployer.deploy(
    AssetActor,
    AssetRegistry.address,
    ProductRegistry.address
  );

  // Issuance
  await deployer.deploy(AssetIssuer);

  // Tokenization
  await deployer.deploy(
    TokenizationFactory,
    AssetRegistry.address
  );

  await AssetActorInstance.registerIssuer(AssetIssuer.address);
};
