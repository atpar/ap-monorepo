pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract PaymentRegistry is Ownable {
	
	struct Payment {
		bytes32 contractId;
		bytes32 eventId;
		address token;
		uint256 amount;
		uint256 timestamp;
	}

	address paymentRouter;

	// paymentId => Payment    
	mapping (bytes32 => Payment) paymentRegistry;
	
	// // payoutId (keccak256(abi.encoded(contract, eventId)) => payee => paymentId[]
	// mapping (bytes32 => mapping (address => bytes32[])) public paymentIdRegistry;

	modifier onlyPaymentRouter {
		require(msg.sender == paymentRouter);
		_;
	}

	function setPaymentRouter (address _paymentRouter) onlyOwner () external {
		paymentRouter = _paymentRouter;
	}
	
	function registerPayment (
		bytes32 _contractId, 
		bytes32 _eventId,  
		address _token,
		uint256 _amount
	) 
		public 
		payable
	{		
		bytes32 paymentId = keccak256(abi.encodePacked(
			_contractId, 
			_eventId,
			_token,
			_amount,
			block.timestamp
		));

		require(paymentRegistry[paymentId].contractId == bytes32(0));
		
		Payment memory payment = Payment(
			_contractId,
			_eventId,
			_token,
			_amount, 
			block.timestamp
		);
	
		paymentRegistry[paymentId] = payment;
	}
	
	// function getPaymentIdsForEvent (address _contract, bytes32 _eventId)
	// 	public
	// 	view
	// 	returns (bytes32[] memory)
	// {
	// 	return (paymentIdRegistry[_contract][_eventId]);
	// }
	
	function getPayment (bytes32 _paymentId)
		public
		view
		returns (Payment memory)
	{
		return (paymentRegistry[_paymentId]);
	}
}
