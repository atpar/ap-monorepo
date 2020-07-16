// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "./IInitializableICT.sol";
import "../FDT/proxy/ProxyFactory.sol";

// @dev Mock lib to link pre-deployed UpgradeSafeICT contract
library ICTLogic {
    function _() public pure { revert("never deploy it"); }
}

/**
 * @title ICTFactory
 * @notice Factory for deploying UpgradeSafeICT contracts
 */
contract ICTFactory is ProxyFactory {

    event DeployedICT(address icToken, address creator);


    /*
     * deploys and initializes a new ICT (proxy) contract
     * @param assetRegistry
     * @param dataRegistry
     * @param marketObjectCode
     * @param owner of the new ICT contract
     * @param salt as defined by EIP-1167
     */
    function createICToken(
        address assetRegistry,
        address dataRegistry,
        bytes32 marketObjectCode,
        address owner,
        uint256 salt
    )
        external
    {
        address logic = address(ICTLogic);

        address icToken = create2Eip1167Proxy(logic, salt);
        IInitializableICT(icToken).initialize(assetRegistry, dataRegistry, marketObjectCode, owner);

        emit DeployedICT(icToken, msg.sender);
    }
}
