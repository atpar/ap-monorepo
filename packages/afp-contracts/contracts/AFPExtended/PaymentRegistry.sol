pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract PaymentRegistry is Ownable {
  
	event Paid(bytes32, uint256, uint256);

	struct Payoff {
		int8 cashflowId;
		address token;
		uint256 balance;
	}

	address public paymentRouter;

	// contractId => eventId => Payoff    
	mapping (bytes32 => mapping (uint256 => Payoff)) payoffRegistry;


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
		if (payoffRegistry[_contractId][_eventId].cashflowId == int8(0)) {
			payoffRegistry[_contractId][_eventId] = Payoff(
				_cashflowId,
				_token,
				_amount
			);
		} else {
			payoffRegistry[_contractId][_eventId].balance += _amount;
		}

		emit Paid(_contractId, _eventId, _amount);
	}

	function getPayoffBalance (bytes32 _contractId, uint256 _eventId)
		external
		view
		returns (uint256)
	{
		return payoffRegistry[_contractId][_eventId].balance;
	}
	
	function getPayoff (bytes32 _contractId, uint256 _eventId)
		external
		view
		returns (int8, address, uint256)
	{
		return (
			payoffRegistry[_contractId][_eventId].cashflowId, 
			payoffRegistry[_contractId][_eventId].token,
			payoffRegistry[_contractId][_eventId].balance
		);
	}
}
