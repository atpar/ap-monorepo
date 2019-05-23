pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./SharedTypes.sol";
import "./IOwnershipRegistry.sol";


contract OwnershipRegistry is SharedTypes, IOwnershipRegistry {

	// assetId => AssetOwnership
	mapping (bytes32 => AssetOwnership) public assetOwnerships;
	// assetId => cashflowId => Ownership
	mapping (bytes32 => mapping (int8 => address payable)) cashflowBeneficiaries;

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
		returns (AssetOwnership memory)
	{
		return assetOwnerships[assetId];
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

	/**
	 * registers the addresses of the owners of an asset
	 * owner of creator-side payment obligations, owner of creator-side payment claims
	 * counterparty-side payment obligations, counterparty-side payment claims
	 * @param assetId id of the asset
	 * @param ownership the address of the owner of creator-side payment obligations
	 */
	function registerOwnership(
		bytes32 assetId,
		AssetOwnership memory ownership
	)
		public
	{
		require(assetOwnerships[assetId].recordCreatorObligor == address(0), "ENTRY_ALREADY_EXISTS");

		assetOwnerships[assetId] = ownership;
	}
}
