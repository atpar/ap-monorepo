// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";

import "./IInitializableFDT.sol";
import "../proxy/ProxyFactory.sol";


// @dev Mock lib to link pre-deployed ProxySafeVanillaFDT contract
library VanillaFDTLogic {
    function _() public pure { revert("never deploy it"); }
}

// @dev Mock lib to link pre-deployed ProxySafeSimpleRestrictedFDT contract
library SimpleRestrictedFDTLogic {
    function _() public pure { revert("never deploy it"); }
}

/**
 * @title FDTFactory
 * @notice Factory for deploying FDT contracts
 */
contract FDTFactory is ProxyFactory {

    event DeployedDistributor(address distributor, address creator);


    /**
     * deploys a new tokenized distributor contract for a specified ERC20 token
     * @dev mints initial supply after deploying the tokenized distributor contract
     * @param name name of the token
     * @param symbol of the token
     * @param initialSupply of distributor tokens
     */
    function createERC20Distributor(
        string calldata name,
        string calldata symbol,
        uint256 initialSupply,
        IERC20 token,
        address owner,
        uint256 salt
    )
        external
    {
        address logic = address(VanillaFDTLogic);
        createFDT(name, symbol, initialSupply, token, owner, logic, salt);
    }

    function createRestrictedERC20Distributor(
        string calldata name,
        string calldata symbol,
        uint256 initialSupply,
        IERC20 token,
        address owner,
        uint256 salt
    )
        external
    {
        address logic = address(SimpleRestrictedFDTLogic);
        createFDT(name, symbol, initialSupply, token, owner, logic, salt);
    }

    function createFDT(
        string calldata name,
        string calldata symbol,
        uint256 initialSupply,
        IERC20 token,
        address owner,
        address logic,
        uint256 salt
    )
        internal
    {
        require(
            address(token) != address(0),
            "FDTFactory.createFDT: INVALID_FUNCTION_PARAMETERS"
        );

        address distributor = create2Eip1167Proxy(logic, salt);
        IInitializableFDT(distributor).initialize(name, symbol, token, owner, initialSupply);

        emit DeployedDistributor(distributor, msg.sender);
    }
}
