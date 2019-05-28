pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "actus-solidity/contracts/Core/Definitions.sol";

import "../SharedTypes.sol";


contract AssetRegistryStorage is SharedTypes, Definitions {

  struct Asset {
    bytes32 assetId;
    AssetOwnership ownership;
    mapping (int8 => address payable) cashflowBeneficiaries;
    ContractTerms terms;
		ContractState state;
		uint256 eventId;
		address actor;
  }

  mapping (bytes32 => Asset) public assets;
}
