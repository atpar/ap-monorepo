// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "diamond-3/contracts/Diamond.sol";


/**
 * @title BaseRegistry
 * @notice Registry for ACTUS Protocol assets
 */
contract AssetRegistryDiamond is Diamond {

  constructor(IDiamondCut.FacetCut[] memory _diamondCut, address _owner) Diamond(_diamondCut, _owner) payable {}
}
