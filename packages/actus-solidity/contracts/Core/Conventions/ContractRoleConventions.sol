// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;

import "../ACTUSTypes.sol";


/**
 * @title ContractRoleConventions
 */
contract ContractRoleConventions {

    /**
     * Returns the role sign for a given Contract Role.
     */
    function roleSign(ContractRole contractRole)
        internal
        pure
        returns (int8)
    {
        if (contractRole == ContractRole.RPA) return 1;
        if (contractRole == ContractRole.RPL) return -1;

        if (contractRole == ContractRole.BUY) return 1;
        if (contractRole == ContractRole.SEL) return -1;

        if (contractRole == ContractRole.RFL) return 1;
        if (contractRole == ContractRole.PFL) return -1;

        revert("ContractRoleConvention.roleSign: ATTRIBUTE_NOT_FOUND");
    }
}
