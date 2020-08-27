// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol";

/**
 * @title CloneFactory
 * @notice Factory for deploying Proxy contracts
 */
contract CloneFactory {
    using Address for address;


    /**
     * @dev `create` a instance
     * @param logic contract address the proxy `delegatecall`s
     */
    function createClone(address logic) internal returns (address newAddr)
    {
        require(
            logic.isContract(),
            "CloneFactory.createClone: INVALID_FUNCTION_PARAMETERS"
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

            newAddr := create(
                0,      // 0 wei
                bytecode,
                0x37   // bytecode size
            )
        }
    }
}
