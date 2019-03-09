pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract PaymentRegistry_ is Ownable {
  
	event Paid(bytes32, bytes32);

	struct Payment {
		bytes32 contractId;
		int8 cashflowId;
		uint256 eventId;
		address token;
		uint256 amount;
		uint256 timestamp;
	}

	address public paymentRouter;

	// paymentId => Payment    
	mapping (bytes32 => Payment) paymentRegistry;
	
	// // payoutId (keccak256(abi.encoded(contract, eventId)) => payee => paymentId[]
	// mapping (bytes32 => mapping (address => bytes32[])) public paymentIdRegistry;

	modifier onlyPaymentRouter {
		require(msg.sender == paymentRouter, "UNAUTHORIZED_SENDER");
		_;
	}

	function setPaymentRouter (address _paymentRouter) onlyOwner () external {
		paymentRouter = _paymentRouter;
	}
	
	function registerPayment (
		bytes32 _contractId,
		int8 _cashflowId,
		uint256 _eventId,
		address _token,
		uint256 _amount
	) 
		external 
		payable
		onlyPaymentRouter ()
	{		
		bytes32 paymentId = keccak256(abi.encodePacked(
			_contractId,
			_cashflowId,
			_eventId,
			block.timestamp
		));

		require(paymentRegistry[paymentId].contractId == bytes32(0), "ENTRY_ALREADY_EXISTS");
		
		Payment memory payment = Payment(
			_contractId,
			_cashflowId,
			_eventId,
			_token,
			_amount, 
			block.timestamp
		);
	
		paymentRegistry[paymentId] = payment;

		emit Paid(paymentId, _contractId);
	}
	
	// function getPaymentIdsForEvent (address _contract, bytes32 _eventId)
	// 	public
	// 	view
	// 	returns (bytes32[] memory)
	// {
	// 	return (paymentIdRegistry[_contract][_eventId]);
	// }
	
	function getPayment (bytes32 _paymentId)
		external
		view
		returns (Payment memory)
	{
		return (paymentRegistry[_paymentId]);
	}
}
