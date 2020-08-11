const DvPSettlement = artifacts.require('DvPSettlement');


module.exports = async (callback) => {

  console.log('Deploying DvPSettlement');

  try {
    const instance = await DvPSettlement.new();
    console.log(instance.address);
  } catch (error) {
    console.log(error);
    callback(error);
  }

  console.log('Done.');

  callback();
}