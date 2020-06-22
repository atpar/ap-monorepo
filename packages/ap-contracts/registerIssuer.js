const ANNActor = artifacts.require('ANNActor');
const CECActor = artifacts.require('CECActor');
const CEGActor = artifacts.require('CEGActor');
const PAMActor = artifacts.require('PAMActor');


module.exports = async (callback) => {
  const issuer = '0xC2ce200021af63297fECB10DaaD7962fB9Cdb2e8';

  console.log('Registering address (' + issuer + ') as Issuer for all Actors.');

  const annActorInstance = await ANNActor.deployed();
  await annActorInstance.registerIssuer(issuer);
  const cecActorInstance = await CECActor.deployed();
  await cecActorInstance.registerIssuer(issuer);
  const cegActorInstance = await CEGActor.deployed();
  await cegActorInstance.registerIssuer(issuer);
  const pamActorInstance = await PAMActor.deployed();
  await pamActorInstance.registerIssuer(issuer);

  console.log('Done.');

  callback();
}