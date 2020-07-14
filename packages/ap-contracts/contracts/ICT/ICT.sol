// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "./UpgradeSafeICT.sol";


contract ICT is UpgradeSafeICT {

    constructor(
        IAssetRegistry assetRegistry,
        DataRegistry dataRegistry,
        bytes32 marketObjectCode
    ) public {
        initialize(assetRegistry, dataRegistry, marketObjectCode, msg.sender);
    }

}
