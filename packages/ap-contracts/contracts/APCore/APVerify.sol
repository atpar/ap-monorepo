pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";


contract APVerify {

	struct EIP712Domain {
		string  name;
		string  version;
		uint256 chainId;
		address verifyingContract;
	}

	struct ContractUpdate {
		bytes32 assetId;
		address payable recordCreator;
		address payable counterparty;
		address contractAddress;
		bytes32 contractTermsHash;
		bytes32 contractStateHash;
		uint256 contractUpdateNonce;
	}

	bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256(
		"EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
	);

	bytes32 constant CONTRACTUPDATE_TYPEHASH = keccak256(
		"ContractUpdate(bytes32 assetId,address recordCreator,address counterparty,address contractAddress,bytes32 contractTermsHash,bytes32 contractStateHash,uint256 contractUpdateNonce)"
	);

	bytes32 DOMAIN_SEPARATOR;

	constructor () public {
		DOMAIN_SEPARATOR = hashStruct(EIP712Domain({
			name: "ACTUS Protocol",
			version: "1",
			chainId: 0,
			verifyingContract: address(this)
		}));
	}

	function hashStruct(EIP712Domain memory eip712Domain)
		internal
		pure
		returns (bytes32)
	{
		return keccak256(abi.encode(
			EIP712DOMAIN_TYPEHASH,
			keccak256(bytes(eip712Domain.name)),
			keccak256(bytes(eip712Domain.version)),
			eip712Domain.chainId,
			eip712Domain.verifyingContract
		));
	}

	function hashStruct(ContractUpdate memory contractUpdate)
		internal
		pure
		returns (bytes32)
	{
		return keccak256(abi.encode(
			CONTRACTUPDATE_TYPEHASH,
			contractUpdate.assetId,
			contractUpdate.recordCreator,
			contractUpdate.counterparty,
			contractUpdate.contractAddress,
			contractUpdate.contractTermsHash,
			contractUpdate.contractStateHash,
			contractUpdate.contractUpdateNonce
		));
	}

	function verifyContractUpdate(
		ContractUpdate memory contractUpdate,
		bytes memory recordCreatorSignature,
		bytes memory counterpartySignature
	)
		internal
		view
	{
		bytes32 digest = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashStruct(contractUpdate)
		));

		require(ECDSA.recover(digest, recordCreatorSignature) == contractUpdate.recordCreator, "Recovered address is not the record creator");
		require(ECDSA.recover(digest, counterpartySignature) == contractUpdate.counterparty, "Recovered address is not the counterparty");
	}
}