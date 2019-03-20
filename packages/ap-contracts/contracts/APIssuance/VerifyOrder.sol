pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

import "../APCore/APDefinitions.sol";

contract VerifyOrder is APDefinitions {

	struct EIP712Domain {
		string  name;
		string  version;
		uint256 chainId;
		address verifyingContract;
	}

  struct Order {
    address payable maker;
    address payable taker;
    address actor;
    ContractTerms terms;
    address makerCreditEnhancement;
    address takerCreditEnhancement;
    uint256 salt;
  }

	bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256(
		"EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
	);

	bytes32 constant ORDER_TYPEHASH = keccak256(
		"Order(address maker,address taker,address actor,bytes32 contractTermsHash,address makerCreditEnhancement,address takerCreditEnhancement,uint256 salt)"
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

  function hashStruct(ContractTerms memory terms) 
    internal
    pure
    returns(bytes32)
  {
    return keccak256(abi.encode(terms));
  }

	function hashStruct(Order memory order)
		internal
		pure
		returns(bytes32)
	{
		return keccak256(abi.encode(
			ORDER_TYPEHASH,
			order.maker,
			order.taker,
			order.actor,
			hashStruct(order.terms),
      order.makerCreditEnhancement,
      order.takerCreditEnhancement,
			order.salt
		));
	}

	function assertOrderSignatures(
		Order memory order,
		bytes memory makerSignature,
		bytes memory takerSignature
	)
		internal 
		view
    returns(bool)
	{
		bytes32 digest = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashStruct(order)
		));

		require(ECDSA.recover(digest, makerSignature) == order.maker, "INVALID_ORDER_SIGNATURE: Recovered address is not the maker!");
		require(ECDSA.recover(digest, takerSignature) == order.taker, "INVALID_ORDER_SIGNATURE: Recovered address is not the taker!");
    
    return true;
	}
}