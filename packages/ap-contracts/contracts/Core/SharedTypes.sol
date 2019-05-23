pragma solidity ^0.5.2;


contract SharedTypes {

	struct AssetOwnership {
		address recordCreatorObligor;
		address payable recordCreatorBeneficiary;
		address counterpartyObligor;
		address payable counterpartyBeneficiary;
	}
}