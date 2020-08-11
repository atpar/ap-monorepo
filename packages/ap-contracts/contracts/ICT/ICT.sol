// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "./ProxySafeICT.sol";


contract ICT is IERC20, ProxySafeICT {

    constructor(
        IAssetRegistry assetRegistry,
        DataRegistry dataRegistry,
        bytes32 marketObjectCode
    ) public {
        initialize(assetRegistry, dataRegistry, marketObjectCode, msg.sender);
    }

}
