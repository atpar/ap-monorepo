/**
 * @dev Buidler does not support "linking by name"
 * This module provides a rough "work around" for this
 */

module.exports = {
    isRunUnderBuidler,
    linkByPlaceholders,
    linkByPlaceholdersAndDeploy,
    unlinkByPlaceholders
};

/**
 * @return {boolean} true if run under buidler
 */
function isRunUnderBuidler() {
    return typeof buidlerArguments === 'object';
}

/**
 * Link external addresses by placeholders and deploy a contract
 * (i.e. replace placeholders in the bytecode from the addresses, deploy, and restore them back)
 * Placeholders must exactly match ones from the artifact the buidler generates
 * @param contract buidler Contract
 * @param addressMapping Object with "placeholder to address" key-value pairs
 * @param force if true, ignore whether buidler runs or not
 * @return contract.new()
 */
async function linkByPlaceholdersAndDeploy(contract, addressMapping, force) {
    beWarned(force);

    linkByPlaceholders(contract, addressMapping);
    const instance = await contract.new();
    unlinkByPlaceholders(contract, addressMapping);

    return instance;
}

/**
 * Link external addresses "by placeholder"
 * (i.e. replace placeholders in the bytecode with addresses)
 * Placeholders must exactly match ones from the artifact `bytecode`
 * @param contract Web3/Truffle/Buidler Contract
 * @param addressMapping Object with "placeholder to address" key-value pairs
 * @param force if true, ignore whether buidler runs or not
 */
function linkByPlaceholders(contract, addressMapping, force) {
    beWarned(force);
    processPlaceholders(contract, addressMapping, false);
}

/**
 * Restore placeholders in the butecode
 * (replacing encoded addresses with placeholders)
 * @param contract Web3/Truffle/Buidler
 * @param addressMapping Object with "placeholder to address" key-value pairs
 * @param force if true, ignore whether buidler runs or not
 */
function unlinkByPlaceholders(contract, addressMapping, force) {
    beWarned(force);
    processPlaceholders(contract, addressMapping, true);
}

function processPlaceholders(contract, addressMapping, restorePlaceholders = false) {
    const linkAddress = (bytecode) => Object.keys(addressMapping).reduce(
        (acc, key) => {
            if (key.length !== 40) throw new Error('invalid placeholder');
            if (!web3.utils.isAddress(addressMapping[key])) throw  new Error('invalid address');
            const addressBytes = addressMapping[key].replace('0x', '').padStart(40, '0').toLowerCase();
            return restorePlaceholders !== true
                ? acc.replace(key, addressBytes)
                : acc.replace(addressBytes, key);
        },
        bytecode,
    );
    contract.bytecode = linkAddress(contract.bytecode);
    contract.deployedBytecode = linkAddress(contract.deployedBytecode);
}

function beWarned(force) {
    if (force === true || isRunUnderBuidler()) return;

    throw new Error('buidler-helper: it seems to have been called w/o buidler (do you still wish run it?)');
}
