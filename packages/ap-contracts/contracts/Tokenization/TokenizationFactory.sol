pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../Core/AssetRegistry/IAssetRegistry.sol";

import "funds-distribution-token/contracts/extensions/FDT_ERC20Extension.sol";

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";


/**
 * @title TokenizationFactory
 * @notice Factory for deploying FDT contracts
 */
contract TokenizationFactory {

    IAssetRegistry assetRegistry;


    event DeployedDistributor(address distributor, address creator);

    constructor(
        IAssetRegistry _assetRegistry
    ) public {
        assetRegistry = _assetRegistry;
    }

    /**
     * deploys a new tokenized distributor contract for a specified ERC20 token
     * @dev mints initial supply after deploying the tokenized distributor contract
     * @param name name of the token
     * @param symbol of the token
     * @param initialSupply of distributor tokens
     */
    function createERC20Distributor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        IERC20 token
    )
        public
    {
        require(
            address(token) != address(0),
            "TokenizationFactory.createERC20Distributor: INVALID_FUNCTION_PARAMETERS"
        );

        FDT_ERC20Extension distributor = new FDT_ERC20Extension(name, symbol, token);

        require(
            distributor.mint(msg.sender, initialSupply),
            "TokenizationFactory.createERC20Distributor: Could not mint initial supply"
        );

        emit DeployedDistributor(address(distributor), msg.sender);
    }
}