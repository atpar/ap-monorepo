pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract OwnershipRegistry is Ownable {
	
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

	function registerOwnership (
		bytes32 _contractId, 
		address _recordCreatorObligor, 
		address payable _recordCreatorBeneficiary,
		address _counterpartyObligor, 
		address payable _counterpartyBeneficiary
	) 
		external 
	{
		require(contractOwnerships[_contractId].recordCreatorObligor == address(0), "ENTRY_ALREADY_EXISTS");
		
		contractOwnerships[_contractId] = ContractOwnership(
			_recordCreatorObligor,
			_recordCreatorBeneficiary,
			_counterpartyObligor,
			_counterpartyBeneficiary
		);
	}

	function setBeneficiaryForCashflowId (
		bytes32 _contractId, 
		int8 _cashflowId, 
		address payable _beneficiary
	) 
		external 
	{
		require(_cashflowId != 0, "INVALID_CASHFLOWID");
		
		if (_cashflowId > 0) {
			require(msg.sender == contractOwnerships[_contractId].recordCreatorBeneficiary, "UNAUTHORIZED_SENDER");
		} else {
			require(msg.sender == contractOwnerships[_contractId].counterpartyBeneficiary, "UNAUTHORIZED_SENDER");
		}

		require(cashflowBeneficiaries[_contractId][_cashflowId] == address(0), "ENTRY_ALREADY_EXISTS");

		cashflowBeneficiaries[_contractId][_cashflowId] = _beneficiary;
	}
	
	function getContractOwnership (bytes32 _contractId) 
		external 
		view 
		returns (address, address payable, address, address payable) 
	{
		return (
			contractOwnerships[_contractId].recordCreatorObligor,
			contractOwnerships[_contractId].recordCreatorBeneficiary,
			contractOwnerships[_contractId].counterpartyObligor,
			contractOwnerships[_contractId].counterpartyBeneficiary
		);
	}
	
	function getCashflowBeneficiary (bytes32 _contractId, int8 _cashflowId) 
		external 
		view 
		returns (address payable) 
	{
		return cashflowBeneficiaries[_contractId][_cashflowId];
	}
}
