/**
 * @dev Tools to build `creat2` addresses and EIP-1167 proxy bytecode(s)
 * For details on "bytecode", "deployedBytecode", "init bytecode", etc...
 * Refer to:
 * https://ethereum.stackexchange.com/questions/76334/what-is-the-difference-between-bytecode-init-code-deployed-bytedcode-creation
 * Note examples following the code.
 */
module.exports = (web3) => {
    const { BN, sha3, isAddress, toChecksumAddress } = web3.utils;
    const EIP1167BytecodeRegexp = /0x363d3d373d3d3d363d73([0-9a-f]{32,40})5af43d82803e903d91602b57fd5bf3/i;

    return {
        /**
         * Return the address of a EIP-1167 proxy being deployed with CREATE2
         * @param deployingAddr {string}
         * @param salt {string|number}
         * @param logicAddress {string}
         * @return {string}
         */
        buildCreate2Eip1167ProxyAddress,

        /**
         * @param logicAddress {string}
         * @return {string}
         */
        buildEip1167ProxyBytecode,

        /**
         * Return deployed bytecode of the EIP-1167 proxy
         * @param logicAddress {string}
         * @return {string}
         */
        buildEip1167ProxyDeployedBytecode,

        /**
         * Return the address of a contract being deployed with CREATE2
         * @param deployingAddr {string}
         * @param salt {string|number}
         * @param bytecode {string} init bytecode of the contract
         * @return {string}
         */
        buildCreate2Address,

        /**
         * Extract logic address from EIP-1167 proxy bytecode
         * @param bytecode {string} deployed code
         * @return {string}
         */
        getEip1167ProxyLogicAddress,

        /**
         * Return salt as a 32-bytes hex string
         * @param salt {number|string}
         * @returns {string}
         */
        getPaddedSalt,
    };

    function buildCreate2Eip1167ProxyAddress(deployingAddr, salt, logicAddress) {
        return buildCreate2Address(deployingAddr, salt, buildEip1167ProxyBytecode(logicAddress));
    }

    function buildEip1167ProxyBytecode(logicAddress) {
        const target = logicAddress.toLowerCase().replace(/^0x/, '').padStart(40, '0');
        return `0x3d602d80600a3d3981f3363d3d373d3d3d363d73${target}5af43d82803e903d91602b57fd5bf3`;
    }

    function buildEip1167ProxyDeployedBytecode(logicAddress) {
        const target = logicAddress.toLowerCase().replace(/^0x/, '').padStart(40, '0');
        return `0x363d3d373d3d3d363d73${target}5af43d82803e903d91602b57fd5bf3`;
    }

    /**
     * Extract logic address from EIP-1167 proxy bytecode
     * @param bytecode {string} deployed code
     * @return {string}
     */
    function getEip1167ProxyLogicAddress(bytecode) {
        if (typeof bytecode === 'string') {
            const logic = '0x' + bytecode.replace(EIP1167BytecodeRegexp, '$1').padStart(40, '0');
            if (isAddress(logic)) return toChecksumAddress(logic);
        }
        return '';
    }

    function buildCreate2Address(deployingAddr, salt, bytecode) {
        // keccak256(0xff ++ deployingAddr ++ salt ++ keccak256(bytecode))
        const prefix = '0xff' + deployingAddr.replace(/^0x/, '').padStart(40, '0');
        const paddedSalt = getPaddedSalt(salt);
        const bytecodeHash = sha3(`${bytecode.startsWith('0x') ? '' : '0x'}${bytecode}`).replace(/^0x/, '');
        return toChecksumAddress(
            '0x' + sha3(`${prefix}${paddedSalt}${bytecodeHash}`.toLowerCase()).slice(-40),
        );
    }

    function  getPaddedSalt(salt) {
        return (new BN(salt)).toString(16).replace(/^0x/, '').padStart(64, '0');
    }
};

/* TODO: create unit-tests for CREATE2/EIP-1167 utilities from notes bellow
if (!web3) var web3 = require('web3'); let { buildCreate2Eip1167ProxyAddress, buildCreate2Address, buildEip1167ProxyBytecode, buildEip1167ProxyDeployedBytecode, getEip1167ProxyLogicAddress } = require('./test/helper/proxy/create2.js')(web3)
buildCreate2Address('0x0000000000000000000000000000000000000000', '0', '0x00') === '0x4D1A2e2bB4F88F0250f26Ffff098B0b30B26BF38'
buildCreate2Address('0x0000000000000000000000000000000000000000', 0, '0x00') === '0x4D1A2e2bB4F88F0250f26Ffff098B0b30B26BF38'
buildCreate2Address('0xdeadbeef00000000000000000000000000000000', 0, '0x00') === '0xB928f69Bb1D91Cd65274e3c79d8986362984fDA3'
buildCreate2Address('0xdeadbeef', '0xcafebabe', '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef') === '0x1d8bfDC5D46DC4f61D6b6115972536eBE6A8854C'
buildEip1167ProxyBytecode('0xf105Cb033D5393c14665e47899a1d44796d6b764') === '0x3d602d80600a3d3981f3363d3d373d3d3d363d73f105cb033d5393c14665e47899a1d44796d6b7645af43d82803e903d91602b57fd5bf3'
getEip1167ProxyLogicAddress('0x363d3d373d3d3d363d73f105cb033d5393c14665e47899a1d44796d6b7645af43d82803e903d91602b57fd5bf3') === '0xf105Cb033D5393c14665e47899a1d44796d6b764'
buildCreate2Eip1167ProxyAddress('0xE9a8C1efEFB72D804977933B052191c18F530343', 4, '0xf105Cb033D5393c14665e47899a1d44796d6b764') === '0x0a46E1FDDA60606F60cE073284C6EBBd6E7c1452'
buildCreate2Eip1167ProxyAddress('0x970550B4C7da0b85555A3fb424fb940aaA82391c',10, '0x8633243aFc3B75d7A1e1F79FCe1f4b9524B87347') === '0x35FedB8f79674C003d32AA9D7438D7F7888710c7'
buildCreate2Eip1167ProxyAddress('0xa4bcDF64Cdd5451b6ac3743B414124A6299B65FF', 555, '0xB00cC45B4a7d3e1FEE684cFc4417998A1c183e6d') === '0x8C40601Be58a9DBd0D4Ea3dEf93104d122164eE4'
buildCreate2Eip1167ProxyAddress('0xa4bcDF64Cdd5451b6ac3743B414124A6299B65FF', 888, '0xB00cC45B4a7d3e1FEE684cFc4417998A1c183e6d') === '0x945D077114A0D2AED6769c4E5E3C7DD6Be4C963a'
buildCreate2Eip1167ProxyAddress('0xa4bcDF64Cdd5451b6ac3743B414124A6299B65FF', 0xBAD000C0DE000, '0xB00cC45B4a7d3e1FEE684cFc4417998A1c183e6d') === '0x20574dDD0f1DEaa8FDE6D3b5A04f4CF7C9f797F9'
*/
