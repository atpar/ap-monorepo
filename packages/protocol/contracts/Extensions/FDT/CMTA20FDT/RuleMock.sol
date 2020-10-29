// "SPDX-License-Identifier: MPL"

/* 
 * Copyright (c) Capital Market and Technology Association, 2018-2019
 * https://cmta.ch
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. 
 */

pragma solidity ^0.7.0;


contract RuleMock {

  uint8 private constant AMOUNT_TOO_HIGH = 10;
  string private constant TEXT_AMOUNT_TOO_HIGH = "Amount too high";
  string private constant TEXT_CODE_NOT_FOUND = "Code not found";

  function isTransferValid(address _from, address _to, uint256 _amount) public pure returns (bool isValid) {
    return detectTransferRestriction(_from, _to, _amount) == 0;
  }

  function detectTransferRestriction(address /* _from */, address /* _to */, uint256 _amount) public pure returns (uint8) {
    return _amount < 20 ? 0 : AMOUNT_TOO_HIGH;
  }

  function canReturnTransferRestrictionCode(uint8 _restrictionCode) public pure returns (bool) {
    return _restrictionCode == AMOUNT_TOO_HIGH;
  }

  function messageForTransferRestriction(uint8 _restrictionCode) external pure returns (string memory) {
    return _restrictionCode == AMOUNT_TOO_HIGH ? TEXT_AMOUNT_TOO_HIGH : TEXT_CODE_NOT_FOUND;
  }
}
