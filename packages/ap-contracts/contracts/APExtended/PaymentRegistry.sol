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

	/**
	 * whitelists the address of the payment router for registering payments
	 * @dev can only be called by the owner of the contract
	 * @param _paymentRouter address of the payment router
	 */
	function setPaymentRouter(address _paymentRouter) external onlyOwner {
		paymentRouter = _paymentRouter;
	}
	
	/**
	 * register a payment made for servicing a claim from a specific financial asset
	 * @dev can only be called by the whitelisted payment router
	 * @param contractId id of the asset to which the claim (i.e. eventId) relates
	 * @param cashflowId id of the claim which is serviced with the payment
	 * @param eventId id of the specific contractual event which is serviced with the payment
	 * @param token the address of the token contract from which tokens are transferred with the payment
	 * @param amount the amount transferred with the payment
	 */
	function registerPayment(
		bytes32 contractId,
		int8 cashflowId,
		uint256 eventId,
		address token,
		uint256 amount
	) 
		external 
		payable
		onlyPaymentRouter
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

	/**
	 * retrieve the total balance (sum over all amounts) paid for servicing a specific claim
	 * @param contractId id of the asset to which the claim (i.e. eventId) relates
	 * @param eventId id of the specific contractual event for which the total balance paid should be retrieved
	 * @return current balance paid off for the given claim
	 */
	function getPayoffBalance(bytes32 contractId, uint256 eventId)
		external
		view
		returns (uint256)
	{
		return payoffRegistry[contractId][eventId].balance;
	}
	
	/**
	 * retrieve the full details of amounts paid for servicing a specific claim
	 * @param contractId id of the asset to which the claim (i.e. eventId) relates
	 * @param eventId id of the specific contractual event for which the total balance paid should be retrieved
	 * @return cashflowId, address of the token used to payoff the claim, current balance of the claim
	 */	
	function getPayoff(bytes32 contractId, uint256 eventId)
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
