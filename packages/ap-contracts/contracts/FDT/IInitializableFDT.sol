// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";


interface IInitializableFDT {
    /**
     * @dev Inits a Funds Distribution (FD) token contract and mints initial supply
     * @param name of the FD token
     * @param symbol of the FD token
     * @param fundsToken that the FD tokens distributes funds of
     * @param owner of the FD token
     * @param initialSupply of FD tokens
     */
    function initialize(
        string memory name,
        string memory symbol,
        IERC20 fundsToken,
        address owner,
        uint256 initialSupply
    ) external;
}
