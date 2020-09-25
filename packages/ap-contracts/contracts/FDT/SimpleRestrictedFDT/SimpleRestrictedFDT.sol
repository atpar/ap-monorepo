// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;

import "./ProxySafeSimpleRestrictedFDT.sol";


/**
 * @notice This contract, unlike its parent contract, is entirely instantiated by the `constructor`.
 * Therefore this contract may NOT be used with a proxy that `delegatecall`s it.
 */
contract SimpleRestrictedFDT is ProxySafeSimpleRestrictedFDT {

    constructor(
        string memory name,
        string memory symbol,
        IERC20 _fundsToken,
        address owner,
        uint256 initialAmount
    )
    public
    ProxySafeSimpleRestrictedFDT()
    {
        initialize(name, symbol, _fundsToken, owner, initialAmount);
    }

}
