pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./IPaymentRegistry.sol";


contract PaymentRegistry is IPaymentRegistry, Ownable {

	event Paid(bytes32 indexed assetId, uint256 eventId, uint256 amount);

	struct Payoff {
		int8 cashflowId;
		address token;
		uint256 balance;
	}

	address public paymentRouter;

	// assetId => eventId => Payoff
	mapping (bytes32 => mapping (uint256 => Payoff)) payoffRegistry;


	modifier onlyPaymentRouter {
		require(
			msg.sender == paymentRouter,
			"PaymentRegistry.onlyPaymentRouter: UNAUTHORIZED_SENDER"
		);
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
	 * @param assetId id of the asset to which the claim (i.e. eventId) relates
	 * @param cashflowId id of the claim which is serviced with the payment
	 * @param eventId id of the specific contractual event which is serviced with the payment
	 * @param token the address of the token contract from which tokens are transferred with the payment
	 * @param amount the amount transferred with the payment
	 */
	function registerPayment(
		bytes32 assetId,
		int8 cashflowId,
		uint256 eventId,
		address token,
		uint256 amount
	)
		external
		payable
		onlyPaymentRouter
	{
		if (payoffRegistry[assetId][eventId].cashflowId == int8(0)) {
			payoffRegistry[assetId][eventId] = Payoff(
				cashflowId,
				token,
				amount
			);
		} else {
			payoffRegistry[assetId][eventId].balance += amount;
		}

		emit Paid(assetId, eventId, amount);
	}

	/**
	 * retrieve the total balance (sum over all amounts) paid for servicing a specific claim
	 * @param assetId id of the asset to which the claim (i.e. eventId) relates
	 * @param eventId id of the specific contractual event for which the total balance paid should be retrieved
	 * @return current balance paid off for the given claim
	 */
	function getPayoffBalance(bytes32 assetId, uint256 eventId)
		external
		view
		returns (uint256)
	{
		return payoffRegistry[assetId][eventId].balance;
	}

	/**
	 * retrieve the full details of amounts paid for servicing a specific claim
	 * @param assetId id of the asset to which the claim (i.e. eventId) relates
	 * @param eventId id of the specific contractual event for which the total balance paid should be retrieved
	 * @return cashflowId, address of the token used to payoff the claim, current balance of the claim
	 */
	function getPayoff(bytes32 assetId, uint256 eventId)
		external
		view
		returns (int8, address, uint256)
	{
		return (
			payoffRegistry[assetId][eventId].cashflowId,
			payoffRegistry[assetId][eventId].token,
			payoffRegistry[assetId][eventId].balance
		);
	}
}
