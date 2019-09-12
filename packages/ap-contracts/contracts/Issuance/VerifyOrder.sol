pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

import "actus-solidity/contracts/Core/Definitions.sol";


contract VerifyOrder is Definitions {

	struct EIP712Domain {
		string  name;
		string  version;
		uint256 chainId;
		address verifyingContract;
	}

  struct Order {
    address payable maker;
    address payable taker;
    address engine;
    address actor;
    ContractTerms terms;
    address makerCreditEnhancement;
    address takerCreditEnhancement;
    uint256 salt;
  }

	bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256(
		"EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
	);

	bytes32 constant UNFILLED_ORDER_TYPEHASH = keccak256(
		"Order(address maker,address engine,address actor,bytes32 contractTermsHash,address makerCreditEnhancement,uint256 salt)"
	);

	bytes32 constant FILLED_ORDER_TYPEHASH = keccak256(
		"Order(address maker,address taker,address engine,address actor,bytes32 contractTermsHash,address makerCreditEnhancement,address takerCreditEnhancement,uint256 salt)"
	);

	bytes32 DOMAIN_SEPARATOR;

	constructor () public {
		DOMAIN_SEPARATOR = hashEIP712Domain(EIP712Domain({
			name: "ACTUS Protocol",
			version: "1",
			chainId: 0,
			verifyingContract: address(this)
		}));
	}

	function hashEIP712Domain(EIP712Domain memory eip712Domain)
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

  function hashTerms(ContractTerms memory terms)
    internal
    pure
    returns (bytes32)
  {
    return keccak256(abi.encode(terms));
  }

	function hashUnfilledOrder(Order memory order)
		internal
		pure
		returns (bytes32)
	{
		return keccak256(abi.encode(
			UNFILLED_ORDER_TYPEHASH,
			order.maker,
      order.engine,
			order.actor,
			hashTerms(order.terms),
      order.makerCreditEnhancement,
			order.salt
		));
	}

	function hashFilledOrder(Order memory order)
		internal
		pure
		returns (bytes32)
	{
		return keccak256(abi.encode(
			FILLED_ORDER_TYPEHASH,
			order.maker,
			order.taker,
      order.engine,
			order.actor,
			hashTerms(order.terms),
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
    returns (bool)
	{
		bytes32 makerDigest = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashUnfilledOrder(order)
		));

		bytes32 takerDigest = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashFilledOrder(order)
		));

		if (ECDSA.recover(makerDigest, makerSignature) != order.maker) { return false; }
		if (ECDSA.recover(takerDigest, takerSignature) != order.taker) { return false; }

    return true;
	}
}
