/**
 * @dev Tools to build `creat2` addresses and EIP-1167 proxy bytecode
 */
module.exports = (web3) => {
    const { sha3,  toChecksumAddress } = web3.utils;

    return {
        /**
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
         * @param deployingAddr {string}
         * @param salt {string|number}
         * @param bytecode {string}
         * @return {string}
         */
        buildCreate2Address,
    };

    function buildCreate2Eip1167ProxyAddress(deployingAddr, salt, logicAddress) {
        return buildCreate2Address(deployingAddr, salt, buildEip1167ProxyBytecode(logicAddress));
    }

    function buildEip1167ProxyBytecode(logicAddress) {
        const target = logicAddress.toLowerCase().replace(/^0x/, '').padStart(40, '0');
        return `0x3d602d80600a3d3981f3363d3d373d3d3d363d73${target}5af43d82803e903d91602b57fd5bf3`;
    }

    function buildCreate2Address(deployingAddr, salt, bytecode) {
        // keccak256(0xff ++ deployingAddr ++ salt ++ keccak256(bytecode))
        const prefix = '0xff' + deployingAddr.replace(/^0x/, '').padStart(40, '0');
        const paddedSalt = salt.toString(16).replace(/^0x/, '').padStart(64, '0');
        const bytecodeHash = sha3(`${bytecode.startsWith('0x') ? '' : '0x'}${bytecode}`).replace(/^0x/, '');
        return toChecksumAddress(
            '0x' + sha3(`${prefix}${paddedSalt}${bytecodeHash}`.toLowerCase()).slice(-40),
        );
    }
};

// TODO: decide if include notes bellow as unit-tests
// const {buildCreate2Eip1167ProxyAddress, buildEip1167ProxyBytecode, buildCreate2Address} = require('./test/helper/proxy/create2.js')(Web3)
// buildEip1167ProxyBytecode('0xf105Cb033D5393c14665e47899a1d44796d6b764') === '0x3d602d80600a3d3981f3363d3d373d3d3d363d73f105cb033d5393c14665e47899a1d44796d6b7645af43d82803e903d91602b57fd5bf3'
// buildCreate2Address('0xdeadbeef', '0xcafebabe', '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef') === '0x1d8bfDC5D46DC4f61D6b6115972536eBE6A8854C'
// buildCreate2Eip1167ProxyAddress('0xE9a8C1efEFB72D804977933B052191c18F530343', 4, '0xf105Cb033D5393c14665e47899a1d44796d6b764') === '0x0a46E1FDDA60606F60cE073284C6EBBd6E7c1452'
// buildCreate2Eip1167ProxyAddress('0x970550B4C7da0b85555A3fb424fb940aaA82391c',10, '0x8633243aFc3B75d7A1e1F79FCe1f4b9524B87347') === '0x35FedB8f79674C003d32AA9D7438D7F7888710c7'
