// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "./AccessControl/IAccessControl.sol";
import "./Terms/ITermsRegistry.sol";
import "./State/IStateRegistry.sol";
import "./Schedule/IScheduleRegistry.sol";
import "./Ownership/IOwnershipRegistry.sol";
import "./IBaseRegistry.sol";


interface IAssetRegistry is
    IAccessControl,
    ITermsRegistry,
    IStateRegistry,
    IScheduleRegistry,
    IOwnershipRegistry,
    IBaseRegistry
{}
