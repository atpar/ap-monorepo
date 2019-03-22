pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./IOwnershipRegistry.sol";


contract OwnershipRegistry is IOwnershipRegistry, Ownable {
	
	struct ContractOwnership {
		address recordCreatorObligor; // or covenantor
		address payable recordCreatorBeneficiary;
		address counterpartyObligor;
		address payable counterpartyBeneficiary;
	}

	// contractId => ContractOwnership
	mapping (bytes32 => ContractOwnership) public contractOwnerships;
	// contractId => cashflowId => Ownership
	mapping (bytes32 => mapping (int8 => address payable)) cashflowBeneficiaries;

	function registerOwnership(
		bytes32 contractId, 
		address recordCreatorObligor, 
		address payable recordCreatorBeneficiary,
		address counterpartyObligor, 
		address payable counterpartyBeneficiary
	) 
		external 
	{
		require(contractOwnerships[contractId].recordCreatorObligor == address(0), "ENTRY_ALREADY_EXISTS");
		
		contractOwnerships[contractId] = ContractOwnership(
			recordCreatorObligor,
			recordCreatorBeneficiary,
			counterpartyObligor,
			counterpartyBeneficiary
		);
	}

	function setRecordCreatorBeneficiary(
		bytes32 contractId, 
		address payable newRecordCreatorBeneficiary
	)
		external
	{
		require(contractOwnerships[contractId].recordCreatorBeneficiary != address(0), "ENTRY_DOES_NOT_EXIST");
		require(msg.sender == contractOwnerships[contractId].recordCreatorBeneficiary, "UNAUTHORIZED_SENDER");

		contractOwnerships[contractId].recordCreatorBeneficiary = newRecordCreatorBeneficiary;
	}

	function setCounterpartyBeneficiary(
		bytes32 contractId, 
		address payable newCounterpartyBeneficiary
	)
		external
	{
		require(contractOwnerships[contractId].counterpartyBeneficiary != address(0), "ENTRY_DOES_NOT_EXIST");
		require(msg.sender == contractOwnerships[contractId].counterpartyBeneficiary, "UNAUTHORIZED_SENDER");

		contractOwnerships[contractId].counterpartyBeneficiary = newCounterpartyBeneficiary;
	}

	function setBeneficiaryForCashflowId(
		bytes32 contractId, 
		int8 cashflowId, 
		address payable beneficiary
	) 
		external 
	{
		require(cashflowId != 0, "INVALID_CASHFLOWID");

		if (cashflowBeneficiaries[contractId][cashflowId] == address(0)) {
			if (cashflowId > 0) {
				require(msg.sender == contractOwnerships[contractId].recordCreatorBeneficiary, "UNAUTHORIZED_SENDER");
			} else {
				require(msg.sender == contractOwnerships[contractId].counterpartyBeneficiary, "UNAUTHORIZED_SENDER");
			}
		} else {
			require(msg.sender == cashflowBeneficiaries[contractId][cashflowId], "UNAUTHORIZED_SENDER");
		}

		cashflowBeneficiaries[contractId][cashflowId] = beneficiary;
	}
	
	function getContractOwnership(bytes32 contractId) 
		external 
		view 
		returns (address, address payable, address, address payable) 
	{
		return (
			contractOwnerships[contractId].recordCreatorObligor,
			contractOwnerships[contractId].recordCreatorBeneficiary,
			contractOwnerships[contractId].counterpartyObligor,
			contractOwnerships[contractId].counterpartyBeneficiary
		);
	}
	
	function getCashflowBeneficiary(bytes32 contractId, int8 cashflowId) 
		external 
		view 
		returns (address payable) 
	{
		return cashflowBeneficiaries[contractId][cashflowId];
	}
}
