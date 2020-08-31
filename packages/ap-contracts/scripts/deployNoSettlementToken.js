const NoSettlementToken = artifacts.require('NoSettlementToken');


module.exports = async (callback) => {

  console.log('Deploying NoSettlementToken');

  try {
    const instance = await NoSettlementToken.new();
    console.log(instance.address);
  } catch (error) {
    console.log(error);
    callback(error);
  }

  console.log('Done.');

  callback();
}