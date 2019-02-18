pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./external/open-zeppelin-solidity/Ownable.sol";

/**
* @title proxy factory for stateful contracts
* @author Johannes Escherich
* @notice manages all contract types and their versions via a identifier (<contract type> + <version>)
admin has to add contract (bytecode of contract and contract identifier)
user has to specify the contract identifier and encoded arguments of constructor to deploy new instance
*/
contract StatefulContractProxyFactory is Ownable {

	event ContractDeployed(address deployedAddress);
	event ContractCodeAdded(bytes32 identifier);

	mapping (bytes32 => bytes) public code;

	/**
	* @notice add new contract code to factory 
	* @param _identifier identifier of contract (<contract type> + <version>)
	* @param _code code of contract
	*/
	function addContractCode(bytes32 _identifier, bytes calldata _code)
		external 
		onlyOwner()
	{   
		require(code[_identifier].length <= 0, "identifier is in use"); // overwriting?
		code[_identifier] = _code;
		emit ContractCodeAdded(_identifier);
	}

	/**
	* @notice internal function used to deploy arbitrary contracts
	concatenates bytecode of contract with encoded constructor arguments
	* @param _code code of contract to deploy
	* @param _encodedArgs ABI-encoded constructor arguments (with web3.eth.abi.encodeParameter)
	* @return address of deployed contract 
	*/
	function deployContractCode(bytes memory _code, bytes memory _encodedArgs) 
		internal 
		returns (address deployedAddress) 
	{   
		bytes memory contractCode = abi.encodePacked(_code, _encodedArgs);
		assembly {
			deployedAddress := create(0, add(contractCode, 0x20), mload(contractCode))
			if iszero(extcodesize(deployedAddress)) { 
				revert(0, 0) 
			}
		}		
		return deployedAddress;
	}

	/**
	* @notice deploy new contract corresponding to the identifier
	* @param _identifier idenfitier (<contract type> + <version>) of contract to deploy
	* @param _encodedArgs ABI-encoded constructor arguments (with web3.eth.abi.encodeParameter)
	*/
	function createStatefulContract(bytes32 _identifier, bytes memory _encodedArgs)
		public
		returns (address)
	{
		require(code[_identifier].length > 0, "unknown identifier");
		address deployedContractAddress = deployContractCode(code[_identifier], _encodedArgs);
		emit ContractDeployed(deployedContractAddress);
	}
}