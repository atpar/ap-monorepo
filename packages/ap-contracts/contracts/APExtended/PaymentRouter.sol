pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "./IPaymentRouter.sol";
import "./IOwnershipRegistry.sol";
import "./IPaymentRegistry.sol";


contract PaymentRouter is IPaymentRouter, Ownable {

	IOwnershipRegistry public ownershipRegistry;
	IPaymentRegistry public paymentRegistry;

	constructor (
		IOwnershipRegistry _ownershipRegistry,
		IPaymentRegistry _paymentRegistry
	)
		public
	{
		ownershipRegistry = IOwnershipRegistry(_ownershipRegistry);
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
	 * @param token address of the token to pay (0x0 if paid in Ether)
	 * @param _amount payment amount
	 */
	function settlePayment(
		bytes32 assetId,
		int8 cashflowId,
		uint256 eventId,
		address token,
		uint256 _amount
	)
		external
		payable
	{
		require(assetId != bytes32(0) && cashflowId != int8(0), "INVALID_CONTRACTID_OR_CASHFLOWID");

		uint256 amount;
		address payable payee = ownershipRegistry.getCashflowBeneficiary(assetId, cashflowId);

		address recordCreatorObligor;
		address payable recordCreatorBeneficiary;
		address counterpartyObligor;
		address payable counterpartyBeneficiary;

		(
			recordCreatorObligor,
			recordCreatorBeneficiary,
			counterpartyObligor,
			counterpartyBeneficiary
		) = ownershipRegistry.getOwnership(assetId);

		if (cashflowId > 0) {
			require(msg.sender == counterpartyObligor, "UNAUTHORIZED_SENDER_OR_UNKNOWN_CONTRACTOWNERSHIP");
			if (payee == address(0)) {
				payee = recordCreatorBeneficiary;
			}
		} else {
			require(msg.sender == recordCreatorObligor, "UNAUTHORIZED_SENDER_OR_UNKNOWN_CONTRACTOWNERSHIP");
			if (payee == address(0)) {
				payee = counterpartyBeneficiary;
			}
		}

		if (token == address(0)) {
			(bool result, ) = payee.call.value(msg.value)(""); // solium-disable-line 
			require(result, "TRANSFER_FAILED");
			amount = msg.value;
		} else {
			require(IERC20(token).transferFrom(msg.sender, payee, _amount), "TRANSFER_FAILED");
			amount = _amount;
		}

		paymentRegistry.registerPayment(
			assetId,
			cashflowId,
			eventId,
			token,
			amount
		);
	}
}
