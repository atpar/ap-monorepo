pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./IPaymentRegistry.sol";


contract PaymentRegistry is IPaymentRegistry, Ownable {
  
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
		bytes32 contractId,
		int8 cashflowId,
		uint256 eventId,
		address token,
		uint256 amount
	) 
		external 
		payable
		onlyPaymentRouter ()
	{		
		if (payoffRegistry[contractId][eventId].cashflowId == int8(0)) {
			payoffRegistry[contractId][eventId] = Payoff(
				cashflowId,
				token,
				amount
			);
		} else {
			payoffRegistry[contractId][eventId].balance += amount;
		}

		emit Paid(contractId, eventId, amount);
	}

	function getPayoffBalance (bytes32 contractId, uint256 eventId)
		external
		view
		returns (uint256)
	{
		return payoffRegistry[contractId][eventId].balance;
	}
	
	function getPayoff (bytes32 contractId, uint256 eventId)
		external
		view
		returns (int8, address, uint256)
	{
		return (
			payoffRegistry[contractId][eventId].cashflowId, 
			payoffRegistry[contractId][eventId].token,
			payoffRegistry[contractId][eventId].balance
		);
	}
}
