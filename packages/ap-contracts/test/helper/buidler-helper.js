/* global assert, buidlerArguments */

/**
 * @dev Buidler does not support "linking by name"
 * This module provides a rough "work around" for this
 * See examples in `function _testSelf`
 */
module.exports =(web3) => {
    const {isAddress} = web3.utils;

    return {
        isRunUnderBuidler,
        getPlaceholdersFromBytecode,
        linkAddressesAndDeploy,
        linkByPlaceholdersAndDeploy,
        // _testSelf,
    };

    /**
     * @return {boolean} true if run under buidler
     */
    function isRunUnderBuidler() {
        return typeof buidlerArguments === 'object';
    }

    /**
     * Extract unique placeholders from a bytecode
     * (placeholders, if any, returned in the order they appear in the bytecode)
     * @param bytecode {string}
     * @return [{string}] placeholders
     */
    function getPlaceholdersFromBytecode(bytecode) {
        const placeholderRegexp = /[a-f0-9]*(__.{36}__)[a-f0-9]{2,}/gi;
        const placeholders = [];
        let match = placeholderRegexp.exec(bytecode);
        while(match) {
            if (!placeholders.includes(match[1])) placeholders.push(match[1]);
            match = placeholderRegexp.exec(bytecode);
        }
        return placeholders;
    }

    /**
     * Link addresses, deploy a contract, and return the instance deployed
     *   i.e. replace placeholders with addresses, deploy the contract, and restore the bytecode
     *   addresses must follow in the same order as (unique) placeholders appear the bytecode
     * @param contract buidler Contract
     * @param addresses [string {string}] list of addresses to link with
     * @param force {boolean} if true, ignore whether buidler runs or not
     * @return {Promise<*>} deployed instance (`contract.new()`)
     */
    async function linkAddressesAndDeploy(contract, addresses, force) {
        beWarned(force);

        const placeholders = getPlaceholdersFromBytecode(contract.bytecode);
        if (placeholders.length === 0) throwWithMsg('no placeholders found to link in bytecode');
        if (placeholders.length !== addresses.length) throwWithMsg('placeholders and addresses count mismatches');

        const addressMapping = placeholders.reduce((acc, e, i) => (acc[e] = addresses[i], acc), {});

        return linkDeployUnlink(contract, addressMapping, force);
    }

    /**
     * Link addresses by placeholders mapping, deploy a contract, and return the instance deployed
     * (i.e. replace placeholders in the bytecode with the addresses, deploy, and restore the bytecode)
     * Placeholders must exactly match ones from the artifact the buidler generates
     * @param contract buidler Contract
     * @param addressMapping Object with "placeholder to address" key-value pairs
     * @param force if true, ignore whether buidler runs or not
     * @return contract.new()
     */
    async function linkByPlaceholdersAndDeploy(contract, addressMapping, force) {
        beWarned(force);
        return linkDeployUnlink(contract, addressMapping);
    }

    /** @private */
    async function linkDeployUnlink(contract, addressMapping) {
        const [ oldBytecode, oldDeployedBytecode ] = [contract.bytecode, contract.deployedBytecode];

        replacePlaceholdersInBytecode(contract, addressMapping);
        const instance = await contract.new();
        [contract.bytecode, contract.deployedBytecode] = [ oldBytecode, oldDeployedBytecode ];

        return instance;
    }

    /** @private */
    function replacePlaceholdersInBytecode(contract, addressMapping) {
        const linkAddress = (bytecode) => Object.keys(addressMapping).reduce(
            (acc, key) => {
                if (key.length !== 40) throw new Error('invalid placeholder');
                if (!isAddress(addressMapping[key])) throw  new Error('invalid address');
                const addressBytes = addressMapping[key].replace('0x', '').padStart(40, '0');
                // escape spec symbols before passing to the constructor
                const regexp = new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/gi, '\\$&'), 'gi');
                return acc.replace(regexp, addressBytes)
            },
            bytecode,
        );
        contract.bytecode = linkAddress(contract.bytecode);
        contract.deployedBytecode = linkAddress(contract.deployedBytecode);
    }

    /** @private */
    function beWarned(force) {
        if (force === true || isRunUnderBuidler()) return;

        throwWithMsg('it seems to have been called w/o buidler (do you still wish run it?)');
    }

    /** @private */
    function throwWithMsg(msg) {
        throw new Error(`buidler-helper: ${msg}`);
    }

    /** @private */
    /** @return {Promise<string>} if passed, "success" */
    async function _testSelf() {
        function getSampleData(key) {
            return {
                bytecodeUnlinked: '0x6080b610__$841be2597f4d9c69c442725b7c2d682d84$__6100898988__$841be2597f4d9c69c442725b7c2d682d84$__898989895b73__$8e30c1edc2e8ce660a2408600808dad003$__827BEf65E47B160a01b03841',
                bytecodeLinked:   '0x6080b61099D3242dF57EEb55BE0Ab256B9b5827BEf65E47B610089898899D3242dF57EEb55BE0Ab256B9b5827BEf65E47B898989895b733fC20BE7e478f242c834DD8358c6F4E7BF82c4FD827BEf65E47B160a01b03841',
                placeholders: ['__$841be2597f4d9c69c442725b7c2d682d84$__', '__$8e30c1edc2e8ce660a2408600808dad003$__'],
                addresses: ['0x99D3242dF57EEb55BE0Ab256B9b5827BEf65E47B', '0x3fC20BE7e478f242c834DD8358c6F4E7BF82c4FD'],
                addressMapping: {'__$841be2597f4d9c69c442725b7c2d682d84$__': '0x99D3242dF57EEb55BE0Ab256B9b5827BEf65E47B', '__$8e30c1edc2e8ce660a2408600808dad003$__': '0x3fC20BE7e478f242c834DD8358c6F4E7BF82c4FD'},
                contract: () => ({new: function(){const bc = this.bytecode; return Promise.resolve(bc); }, bytecode: getSampleData('bytecodeUnlinked'), deployedBytecode: getSampleData('bytecodeUnlinked') }),
            }[key];
        }

        try {
            assert(
                getPlaceholdersFromBytecode(getSampleData('bytecodeUnlinked')).reduce((a, e) => (a += e, a), '') === getSampleData('placeholders').reduce((a, e) => (a += e, a), ''),
                'getPlaceholdersFromBytecode failed',
            );
            assert(
                (await linkAddressesAndDeploy(getSampleData('contract')(), getSampleData('addresses'), true)) === getSampleData('bytecodeLinked'),
                'linkAddressesAndDeploy failed',
            );
            assert(
                await linkByPlaceholdersAndDeploy(getSampleData('contract')(), getSampleData('addressMapping'), true) === getSampleData('bytecodeLinked'),
                'linkByPlaceholdersAndDeploy failed',
            );
        } catch (e) { return Promise.reject(e); }
        return "success";
    }
};
