pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "./SharedTypes.sol";
import "./IPaymentRouter.sol";
import "./AssetRegistry/IAssetRegistry.sol";
import "./IPaymentRegistry.sol";


contract PaymentRouter is SharedTypes, IPaymentRouter, Ownable {

	IAssetRegistry public assetRegistry;
	IPaymentRegistry public paymentRegistry;

	constructor (
		IAssetRegistry _assetRegistry,
		IPaymentRegistry _paymentRegistry
	)
		public
	{
		assetRegistry = IAssetRegistry(_assetRegistry);
		paymentRegistry = IPaymentRegistry(_paymentRegistry);
	}

	/**
	 * routes a payment to the designated beneficiary and
	 * registers that the payment was made in the payment registry
	 * @dev checks if an owner of the specified cashflowId is set,
	 * if not it sends funds to the default beneficiary
	 * @param assetId id of the asset which the payment relates to
	 * @param cashflowId id of the claim ((EventType + 1) * direction of the payment)
	 * @param eventId id of the event (order in the event schedule)
	 * @param token address of the token to pay
	 * @param _amount payment amount
	 */
	function settlePayment(
		bytes32 assetId,
		int8 cashflowId,
		bytes32 eventId,
		address token,
		uint256 _amount
	)
		external
		payable
	{
		require(
			assetId != bytes32(0) && cashflowId != int8(0) && eventId != uint256(0) && token != address(0),
			"PaymentRouter.settlePayment: INVALID_FUNCTION_PARAMETERS"
		);

		address payable payee = assetRegistry.getCashflowBeneficiary(assetId, cashflowId);
		AssetOwnership memory ownership = assetRegistry.getOwnership(assetId);

		if (cashflowId > 0) {
			require(
				msg.sender == ownership.counterpartyObligor,
				"PaymentRouter.settlePayment: UNAUTHORIZED_SENDER_OR_UNKNOWN_OWNERSHIP"
			);
			if (payee == address(0)) {
				payee = ownership.recordCreatorBeneficiary;
			}
		} else {
			require(
				msg.sender == ownership.recordCreatorObligor,
				"PaymentRouter.settlePayment: UNAUTHORIZED_SENDER_OR_UNKNOWN_OWNERSHIP"
			);
			if (payee == address(0)) {
				payee = ownership.counterpartyBeneficiary;
			}
		}

		require(
			IERC20(token).transferFrom(msg.sender, payee, _amount),
			"PaymentRouter.settlePayment: TRANSFER_FAILED"
		);

		paymentRegistry.registerPayment(
			assetId,
			cashflowId,
			eventId,
			token,
			_amount
		);
	}
}
