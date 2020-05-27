pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "../Core/AssetRegistry/IAssetRegistry.sol";
import "../token/FDT/SimpleRestrictedFDT.sol";
import "../token/FDT/VanillaFDT.sol";


/**
 * @title TokenizationFactory
 * @notice Factory for deploying FDT contracts
 */
contract TokenizationFactory {

    IAssetRegistry public assetRegistry;


    event DeployedDistributor(address distributor, address creator);

    constructor(IAssetRegistry _assetRegistry) public {
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
        string calldata name,
        string calldata symbol,
        uint256 initialSupply,
        IERC20 token,
        address owner
    )
        external
    {
        require(
            address(token) != address(0),
            "TokenizationFactory.createERC20Distributor: INVALID_FUNCTION_PARAMETERS"
        );

        VanillaFDT distributor = new VanillaFDT(name, symbol, token, owner, initialSupply);

        emit DeployedDistributor(address(distributor), owner);
    }

    /**
     * deploys a new restricted tokenized distributor contract for a specified ERC20 token
     * @dev mints initial supply after deploying the tokenized distributor contract
     * @param name name of the token
     * @param symbol of the token
     * @param initialSupply of distributor tokens
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
        require(
            address(token) != address(0),
            "TokenizationFactory.createERC20Distributor: INVALID_FUNCTION_PARAMETERS"
        );

        SimpleRestrictedFDT distributor = new SimpleRestrictedFDT(name, symbol, token, owner, initialSupply);

        emit DeployedDistributor(address(distributor), msg.sender);
    }
}