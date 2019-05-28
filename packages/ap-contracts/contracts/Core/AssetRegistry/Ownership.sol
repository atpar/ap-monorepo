pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./AssetRegistryStorage.sol";


contract Ownership is AssetRegistryStorage {

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
		require(
			assets[assetId].ownership.recordCreatorBeneficiary != address(0),
			"AssetRegistry.setRecordCreatorBeneficiary: ENTRY_DOES_NOT_EXIST"
		);
		require(
			msg.sender == assets[assetId].ownership.recordCreatorBeneficiary,
			"AssetRegistry.setRecordCreatorBeneficiary: UNAUTHORIZED_SENDER"
		);

		assets[assetId].ownership.recordCreatorBeneficiary = newRecordCreatorBeneficiary;
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
		require(
			assets[assetId].ownership.counterpartyBeneficiary != address(0),
			"AssetRegistry.setCounterpartyBeneficiary: ENTRY_DOES_NOT_EXIST"
		);
		require(
			msg.sender == assets[assetId].ownership.counterpartyBeneficiary,
			"AssetRegistry.setCounterpartyBeneficiary: UNAUTHORIZED_SENDER"
		);

		assets[assetId].ownership.counterpartyBeneficiary = newCounterpartyBeneficiary;
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
		require(
			cashflowId != 0,
			"AssetRegistry.setBeneficiaryForCashflowId: INVALID_CASHFLOWID"
		);

		if (assets[assetId].cashflowBeneficiaries[cashflowId] == address(0)) {
			if (cashflowId > 0) {
				require(
					msg.sender == assets[assetId].ownership.recordCreatorBeneficiary,
					"AssetRegistry.setBeneficiaryForCashflowId: UNAUTHORIZED_SENDER"
				);
			} else {
				require(
					msg.sender == assets[assetId].ownership.counterpartyBeneficiary,
					"AssetRegistry.setBeneficiaryForCashflowId: UNAUTHORIZED_SENDER"
				);
			}
		} else {
			require(
				msg.sender == assets[assetId].cashflowBeneficiaries[cashflowId],
				"AssetRegistry.setBeneficiaryForCashflowId: UNAUTHORIZED_SENDER"
			);
		}

		assets[assetId].cashflowBeneficiaries[cashflowId] = beneficiary;
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
		return assets[assetId].ownership;
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
		return assets[assetId].cashflowBeneficiaries[cashflowId];
	}
}
