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
	) public {
		ownershipRegistry = IOwnershipRegistry(_ownershipRegistry);
		paymentRegistry = IPaymentRegistry(_paymentRegistry);
	}

	function settlePayment (
		bytes32 contractId,
		int8 cashflowId,
		uint256 eventId,
		address token,
		uint256 _amount
	) 
		external 
		payable
	{
		require(contractId != bytes32(0) && cashflowId != int8(0), "INVALID_CONTRACTID_OR_CASHFLOWID");
		
		uint256 amount;
		address payable payee = ownershipRegistry.getCashflowBeneficiary(contractId, cashflowId);
		
		address recordCreatorObligor;
		address payable recordCreatorBeneficiary;
		address counterpartyObligor;
		address payable counterpartyBeneficiary;

		(recordCreatorObligor, recordCreatorBeneficiary, counterpartyObligor, counterpartyBeneficiary) = ownershipRegistry.getContractOwnership(contractId);
		
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
			(bool result, ) = payee.call.value(msg.value)("");
      require(result, "TRANSFER_FAILED");
			amount = msg.value;
		} else {
			require(IERC20(token).transferFrom(msg.sender, payee, _amount), "TRANSFER_FAILED");
			amount = _amount;
		}

		paymentRegistry.registerPayment(
			contractId,
			cashflowId,
			eventId,
			token,
			amount
		);
	}
}
