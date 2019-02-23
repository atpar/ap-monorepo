pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";


contract AFPVerify {

	struct EIP712Domain {
		string  name;
		string  version;
		uint256 chainId;
		address verifyingContract;
	}

	struct ContractUpdate {
		bytes32 contractId;
		address payable recordCreatorAddress;
		address payable counterpartyAddress;
		address contractAddress;
		bytes32 contractTermsHash;
		bytes32 contractStateHash;
		uint256 contractUpdateNonce;
	}

	bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256(
		"EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
	);

	bytes32 constant CONTRACTUPDATE_TYPEHASH = keccak256(
		"ContractUpdate(bytes32 contractId,address recordCreatorAddress,address counterpartyAddress,address contractAddress,bytes32 contractTermsHash,bytes32 contractStateHash,uint256 contractUpdateNonce)"
	);

	bytes32 DOMAIN_SEPARATOR;

	constructor () public {
		DOMAIN_SEPARATOR = hashStruct(EIP712Domain({
			name: "Actus Financial Protocol",
			version: "1",
			chainId: 0,
			verifyingContract: address(this)
		}));
	}

	function hashStruct(EIP712Domain memory _eip712Domain) 
		internal 
		pure 
		returns (bytes32) 
	{
		return keccak256(abi.encode(
			EIP712DOMAIN_TYPEHASH,
			keccak256(bytes(_eip712Domain.name)),
			keccak256(bytes(_eip712Domain.version)),
			_eip712Domain.chainId,
			_eip712Domain.verifyingContract
		));
	}

	function hashStruct(ContractUpdate memory _contractUpdate)
		internal
		pure
		returns(bytes32)
	{
		return keccak256(abi.encode(
			CONTRACTUPDATE_TYPEHASH,
			_contractUpdate.contractId,
			_contractUpdate.recordCreatorAddress,
			_contractUpdate.counterpartyAddress,
			_contractUpdate.contractAddress,
			_contractUpdate.contractTermsHash,
			_contractUpdate.contractStateHash,
			_contractUpdate.contractUpdateNonce
		));
	}

	function verifyContractUpdate(
		ContractUpdate memory _contractUpdate, 
		bytes memory _recordCreatorSignature, 
		bytes memory _counterpartySignature
	)
		internal 
		view
	{
		bytes32 digest = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashStruct(_contractUpdate)
		));

		require(ECDSA.recover(digest, _recordCreatorSignature) == _contractUpdate.recordCreatorAddress, "recovered address is not the record creator");
		require(ECDSA.recover(digest, _counterpartySignature) == _contractUpdate.counterpartyAddress, "recovered address is not the counterparty");
	}
}