pragma solidity ^0.5.2;


interface IOwnershipRegistry {
	
	/**
	 * registers the addresses of the owners of an asset
	 * @param contractId id of the asset
	 * @param recordCreatorObligor the address of the owner of creator-side payment obligations
	 * @param recordCreatorBeneficiary the address of the owner of creator-side payment claims
	 * @param counterpartyObligor the address of the owner of counterparty-side payment obligations
	 * @param counterpartyBeneficiary the address of the owner of counterparty-side payment claims
	 */
	function registerOwnership(
		bytes32 contractId,
		address recordCreatorObligor,
		address payable recordCreatorBeneficiary,
		address counterpartyObligor,
		address payable counterpartyBeneficiary
	)
		external;

	/**
	 * update the address of the default beneficiary of cashflows going to the record creator
	 * @param contractId id of the asset
	 * @param newRecordCreatorBeneficiary address of the new beneficiary
	 */
	function setRecordCreatorBeneficiary(
		bytes32 contractId, 
		address payable newRecordCreatorBeneficiary
	)
		external;

	/**
	 * update the address of the default beneficiary of cashflows going to the counter party
	 * @param contractId id of the asset
	 * @param newCounterpartyBeneficiary address of the new beneficiary
	 */
	function setCounterpartyBeneficiary(
		bytes32 contractId, 
		address payable newCounterpartyBeneficiary
	)
		external;

	/**
 	 * register the address of the owner of specific claims of the asset
	 * @param contractId id of the asset
	 * @param cashflowId id of the specific claims for which to register the owner
	 * @param beneficiary the address of the owner
	 */
	function setBeneficiaryForCashflowId(
		bytes32 contractId, 
		int8 cashflowId, 
		address payable beneficiary
	) 
		external;

	/**
 	 * retrieve the registered addresses of owners (Creator, Counterparty) of an asset
	 * @param contractId id of the asset
	 * @return addresses of all owners of the asset
	 */
	function getContractOwnership(bytes32 contractId) 
		external 
		view 
		returns (address, address payable, address, address payable);

	/**
	 * retrieve the registered address of the owner of specific future claims from an asset
	 * @param contractId id of the asset
	 * @param cashflowId the identifier of the specific claims owned by the registerd address
	 * @return address of the beneficiary corresponding to the given cashflowId
	 */
	function getCashflowBeneficiary(bytes32 contractId, int8 cashflowId) 
		external 
		view 
		returns (address payable);
}
