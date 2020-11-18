// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Forwarder is Ownable {

    mapping(address => address) public beneficiaries;


    function setBeneficiary(address token, address beneficiary) external onlyOwner {
        require(
            beneficiaries[token] == address(0),
            "Forwarder.setBeneficiary: Beneficary already set for token."
        );

        beneficiaries[token] = beneficiary;
    }

    function pushAccruedToBeneficiary(address token) external returns(bool) {
        require(
           beneficiaries[token] != address(0),
           "Forwarder.pushAccruedFundsToBeneficiary: No beneficiary set for token."
        );

        uint256 accruedFunds = IERC20(token).balanceOf(beneficiaries[token]);

        return IERC20(token).transfer(beneficiaries[token], accruedFunds);
    }
}

