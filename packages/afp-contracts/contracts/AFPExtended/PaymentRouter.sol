pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "./IOwnershipRegistry.sol";
import "./IPaymentRegistry.sol";


contract PaymentRouter is Ownable {

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
		bytes32 _contractId,
		int8 _cashflowId,
		uint256 _eventId,
		address _token,
		uint256 _amount
	) 
		external 
		payable
	{
		require(_contractId != bytes32(0) && _cashflowId != int8(0), "INVALID_CONTRACTID_OR_CASHFLOWID");
		
		uint256 amount;
		address payable payee = ownershipRegistry.getCashflowBeneficiary(_contractId, _cashflowId);
		
		address recordCreatorObligor;
		address payable recordCreatorBeneficiary;
		address counterpartyObligor;
		address payable counterpartyBeneficiary;

		(recordCreatorObligor, recordCreatorBeneficiary, counterpartyObligor, counterpartyBeneficiary) = ownershipRegistry.getContractOwnership(_contractId);
		
		if (_cashflowId > 0) {
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
		
		if (_token == address(0)) {
			(bool result, ) = payee.call.value(msg.value)("");
      require(result, "TRANSFER_FAILED");
			amount = msg.value;
		} else {
			require(IERC20(_token).transferFrom(msg.sender, payee, _amount), "TRANSFER_FAILED");
			amount = _amount;
		}

		paymentRegistry.registerPayment(
			_contractId,
			_cashflowId,
			_eventId,
			_token,
			amount
		);
	}
}
