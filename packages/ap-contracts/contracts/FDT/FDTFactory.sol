// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";

import "./IInitializableFDT.sol";

import "../helper/ProxyFactory.sol";
import "../helper/CloneFactory.sol";


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
contract FDTFactory is ProxyFactory, CloneFactory {

    event DeployedDistributor(address distributor, address creator);


    /**
     * deploys a new tokenized distributor contract for a specified ERC20 token
     * @dev mints initial supply after deploying the tokenized distributor contract
     * @param name name of the token
     * @param symbol of the token
     * @param initialSupply of distributor tokens
     * @param token address of the token to distribute
     * @param owner address of the owner
     */
    function createERC20Distributor(
        string calldata name,
        string calldata symbol,
        uint256 initialSupply,
        IERC20 token,
        address owner
    )
        external
    {
        address logic = address(VanillaFDTLogic);
        createFDT(name, symbol, initialSupply, token, owner, logic);
    }

    /**
     * deploys a new tokenized distributor contract for a specified ERC20 token
     * @dev mints initial supply after deploying the tokenized distributor contract
     * @param name name of the token
     * @param symbol of the token
     * @param initialSupply of distributor tokens
     * @param token address of the token to distribute
     * @param owner address of the owner
     */
    function createRestrictedERC20Distributor(
        string calldata name,
        string calldata symbol,
        uint256 initialSupply,
        IERC20 token,
        address owner
    )
        external
    {
        address logic = address(SimpleRestrictedFDTLogic);
        createFDT(name, symbol, initialSupply, token, owner, logic);
    }

    /**
     * deploys a new tokenized distributor contract for a specified ERC20 token
     * @dev mints initial supply after deploying the tokenized distributor contract
     * @param name name of the token
     * @param symbol of the token
     * @param initialSupply of distributor tokens
     * @param token address of the token to distribute
     * @param owner address of the owner
     * @param salt create2 salt
     */
    function create2ERC20Distributor(
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
        create2FDT(name, symbol, initialSupply, token, owner, logic, salt);
    }

    /**
     * deploys a new tokenized distributor contract for a specified ERC20 token
     * @dev mints initial supply after deploying the tokenized distributor contract
     * @param name name of the token
     * @param symbol of the token
     * @param initialSupply of distributor tokens
     * @param token address of the token to distribute
     * @param owner address of the owner
     * @param salt create2 salt
     */
    function create2RestrictedERC20Distributor(
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
        create2FDT(name, symbol, initialSupply, token, owner, logic, salt);
    }

    function createFDT(
        string calldata name,
        string calldata symbol,
        uint256 initialSupply,
        IERC20 token,
        address owner,
        address logic
    )
        private
    {
        require(
            address(token) != address(0),
            "FDTFactory.create2FDT: INVALID_FUNCTION_PARAMETERS"
        );

        address distributor = createClone(logic);
        IInitializableFDT(distributor).initialize(name, symbol, token, owner, initialSupply);

        emit DeployedDistributor(distributor, msg.sender);
    }

    function create2FDT(
        string calldata name,
        string calldata symbol,
        uint256 initialSupply,
        IERC20 token,
        address owner,
        address logic,
        uint256 salt
    )
        private
    {
        require(
            address(token) != address(0),
            "FDTFactory.create2FDT: INVALID_FUNCTION_PARAMETERS"
        );

        address distributor = create2Eip1167Proxy(logic, salt);
        IInitializableFDT(distributor).initialize(name, symbol, token, owner, initialSupply);

        emit DeployedDistributor(distributor, msg.sender);
    }
}
