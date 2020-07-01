const ANNActor = artifacts.require('ANNActor');
const CECActor = artifacts.require('CECActor');
const CEGActor = artifacts.require('CEGActor');
const PAMActor = artifacts.require('PAMActor');


module.exports = async (callback) => {
  const issuer = '0xC2ce200021af63297fECB10DaaD7962fB9Cdb2e8';

  console.log('Registering address (' + issuer + ') as Issuer for all Actors.');

  const annActorInstance = await ANNActor.deployed();
  if (await annActorInstance.issuers(issuer) === false) {
    await annActorInstance.registerIssuer(issuer);
  }
  const cecActorInstance = await CECActor.deployed();
  if (await cecActorInstance.issuers(issuer) === false) {
    await cecActorInstance.registerIssuer(issuer);
  }
  const cegActorInstance = await CEGActor.deployed();
  if (await cegActorInstance.issuers(issuer) === false) {
    await cegActorInstance.registerIssuer(issuer);
  }
  const pamActorInstance = await PAMActor.deployed();
  if (await pamActorInstance.issuers(issuer) === false) {
    await pamActorInstance.registerIssuer(issuer);
  }

  console.log('Done.');

  callback();
}