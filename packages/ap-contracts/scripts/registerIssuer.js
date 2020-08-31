const ANNActor = artifacts.require('ANNActor');
const CECActor = artifacts.require('CECActor');
const CEGActor = artifacts.require('CEGActor');
const CERTFActor = artifacts.require('CERTFActor');
const PAMActor = artifacts.require('PAMActor');


module.exports = async (callback) => {
  const issuer = '0x6C51ECF949882c2183357B860FD82Dd4bb631840'; // '0xC2ce200021af63297fECB10DaaD7962fB9Cdb2e8';

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
  const certfActorInstance = await CERTFActor.deployed();
  if (await certfActorInstance.issuers(issuer) === false) {
    await certfActorInstance.registerIssuer(issuer);
  }
  const pamActorInstance = await PAMActor.deployed();
  if (await pamActorInstance.issuers(issuer) === false) {
    await pamActorInstance.registerIssuer(issuer);
  }

  console.log('Done.');

  callback();
}