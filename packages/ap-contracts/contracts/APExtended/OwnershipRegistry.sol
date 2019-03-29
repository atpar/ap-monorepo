pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./IOwnershipRegistry.sol";


contract OwnershipRegistry is IOwnershipRegistry, Ownable {
	
	struct AssetOwnership {
		address recordCreatorObligor; // or covenantor
		address payable recordCreatorBeneficiary;
		address counterpartyObligor;
		address payable counterpartyBeneficiary;
	}

	// assetId => AssetOwnership
	mapping (bytes32 => AssetOwnership) public assetOwnerships;
	// assetId => cashflowId => Ownership
	mapping (bytes32 => mapping (int8 => address payable)) cashflowBeneficiaries;

	/**
	 * registers the addresses of the owners of an asset
	 * @param assetId id of the asset
	 * @param recordCreatorObligor the address of the owner of creator-side payment obligations
	 * @param recordCreatorBeneficiary the address of the owner of creator-side payment claims
	 * @param counterpartyObligor the address of the owner of counterparty-side payment obligations
	 * @param counterpartyBeneficiary the address of the owner of counterparty-side payment claims
	 */
	function registerOwnership(
		bytes32 assetId, 
		address recordCreatorObligor, 
		address payable recordCreatorBeneficiary,
		address counterpartyObligor, 
		address payable counterpartyBeneficiary
	) 
		external 
	{
		require(assetOwnerships[assetId].recordCreatorObligor == address(0), "ENTRY_ALREADY_EXISTS");
		
		assetOwnerships[assetId] = AssetOwnership(
			recordCreatorObligor,
			recordCreatorBeneficiary,
			counterpartyObligor,
			counterpartyBeneficiary
		);
	}

	/**
	 * update the address of the default beneficiary of cashflows going to the record creator
	 * @param assetId id of the asset
	 * @param newRecordCreatorBeneficiary address of the new beneficiary
	 */
	function setRecordCreatorBeneficiary(
		bytes32 assetId, 
		address payable newRecordCreatorBeneficiary
	)
		external
	{
		require(assetOwnerships[assetId].recordCreatorBeneficiary != address(0), "ENTRY_DOES_NOT_EXIST");
		require(msg.sender == assetOwnerships[assetId].recordCreatorBeneficiary, "UNAUTHORIZED_SENDER");

		assetOwnerships[assetId].recordCreatorBeneficiary = newRecordCreatorBeneficiary;
	}

	/**
	 * update the address of the default beneficiary of cashflows going to the counter party
	 * @param assetId id of the asset
	 * @param newCounterpartyBeneficiary address of the new beneficiary
	 */
	function setCounterpartyBeneficiary(
		bytes32 assetId, 
		address payable newCounterpartyBeneficiary
	)
		external
	{
		require(assetOwnerships[assetId].counterpartyBeneficiary != address(0), "ENTRY_DOES_NOT_EXIST");
		require(msg.sender == assetOwnerships[assetId].counterpartyBeneficiary, "UNAUTHORIZED_SENDER");

		assetOwnerships[assetId].counterpartyBeneficiary = newCounterpartyBeneficiary;
	}

	/**
 	 * register the address of the owner of specific claims of the asset
	 * @param assetId id of the asset
	 * @param cashflowId id of the specific claims for which to register the owner
	 * @param beneficiary the address of the owner
	 */
	function setBeneficiaryForCashflowId(
		bytes32 assetId, 
		int8 cashflowId, 
		address payable beneficiary
	) 
		external 
	{
		require(cashflowId != 0, "INVALID_CASHFLOWID");

		if (cashflowBeneficiaries[assetId][cashflowId] == address(0)) {
			if (cashflowId > 0) {
				require(msg.sender == assetOwnerships[assetId].recordCreatorBeneficiary, "UNAUTHORIZED_SENDER");
			} else {
				require(msg.sender == assetOwnerships[assetId].counterpartyBeneficiary, "UNAUTHORIZED_SENDER");
			}
		} else {
			require(msg.sender == cashflowBeneficiaries[assetId][cashflowId], "UNAUTHORIZED_SENDER");
		}

		cashflowBeneficiaries[assetId][cashflowId] = beneficiary;
	}
	
	/**
 	 * retrieve the registered addresses of owners (Creator, Counterparty) of an asset
	 * @param assetId id of the asset
	 * @return addresses of all owners of the asset
	 */
	function getOwnership(bytes32 assetId) 
		external 
		view 
		returns (address, address payable, address, address payable) 
	{
		return (
			assetOwnerships[assetId].recordCreatorObligor,
			assetOwnerships[assetId].recordCreatorBeneficiary,
			assetOwnerships[assetId].counterpartyObligor,
			assetOwnerships[assetId].counterpartyBeneficiary
		);
	}
	
	/**
	 * retrieve the registered address of the owner of specific future claims from an asset
	 * @param assetId id of the asset
	 * @param cashflowId the identifier of the specific claims owned by the registerd address
	 * @return address of the beneficiary corresponding to the given cashflowId
	 */
	function getCashflowBeneficiary(bytes32 assetId, int8 cashflowId) 
		external 
		view 
		returns (address payable) 
	{
		return cashflowBeneficiaries[assetId][cashflowId];
	}
}
