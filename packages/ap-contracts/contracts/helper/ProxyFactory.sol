// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol";

/**
 * @title ProxyFactory
 * @notice Factory for deploying Proxy contracts
 */
contract ProxyFactory {
    using Address for address;

    event NewEip1167Proxy(address proxy, address logic, uint256 salt);


    /**
     * @dev `create2` a new EIP-1167 proxi instance
     * https://eips.ethereum.org/EIPS/eip-1167
     * @param logic contract address the proxy `delegatecall`s
     * @param salt as defined by EIP-1167
     */
    function create2Eip1167Proxy(address logic, uint256 salt) internal returns (address newAddr)
    {
        require(
            logic.isContract(),
            "ProxyFactory.create2Eip1167Proxy: INVALID_FUNCTION_PARAMETERS"
        );

        bytes20 targetBytes = bytes20(logic);
        assembly {
            let bytecode := mload(0x40)

            // 0x3d602d80600a3d3981f3 is the static constructor that returns the EIP-1167 bytecode being:
            // 0x363d3d373d3d3d363d73<target address (20 bytes)>5af43d82803e903d91602b57fd5bf3
            // source: EIP-1167 reference implementation (https://github.com/optionality/clone-factory)
            mstore(bytecode, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(bytecode, 0x14), targetBytes)
            mstore(add(bytecode, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)

            newAddr := create2(
                0,      // 0 wei
                bytecode,
                0x37,   // bytecode size
                salt
            )
        }
        emit NewEip1167Proxy(newAddr, logic, salt);
    }
}
