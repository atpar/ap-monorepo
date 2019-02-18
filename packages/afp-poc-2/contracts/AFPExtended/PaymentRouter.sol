pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./OwnershipRegistryInterface.sol";
import "./PaymentRegistryInterface.sol";

interface IERC20 {
	function transfer(address to, uint256 value) external returns (bool);
	function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract PaymentRouter is Ownable {

	OwnershipRegistryInterface public ownershipRegistry;
	PaymentRegistryInterface public paymentRegistry;

	constructor (
		OwnershipRegistryInterface _ownershipRegistry,
		PaymentRegistryInterface _paymentRegistry
	) public {
		ownershipRegistry = OwnershipRegistryInterface(_ownershipRegistry);
		paymentRegistry = PaymentRegistryInterface(_paymentRegistry);
	}

	function settlePayment (
		bytes32 _contractId,
		int8 _cashflowId,
		bytes32 _eventId,
		address _token,
		uint256 _amount
	) 
		external 
		payable
	{
		require(_contractId != bytes32(0) && _cashflowId != int8(0));
		
		uint256 amount;
		address payable payee = ownershipRegistry.getCashflowBeneficiary(_contractId, _cashflowId);
		
		address recordCreatorObligor;
		address payable recordCreatorBeneficiary;
		address counterpartyObligor;
		address payable counterpartyBeneficiary;

		(recordCreatorObligor, recordCreatorBeneficiary, counterpartyObligor, counterpartyBeneficiary) = ownershipRegistry.getContractOwnership(_contractId);
		
		if (_cashflowId > 0) {
			require(msg.sender == counterpartyObligor);
			if (payee == address(0)) {
				payee = recordCreatorBeneficiary;
			}	
		} else {
			
			require(msg.sender == recordCreatorObligor);
			if (payee == address(0)) {
				payee = counterpartyBeneficiary;
			}
		}	
		
		if (_token == address(0)) {
			amount = msg.value;
			require(payee.send(msg.value));
		} else {
			require(IERC20(_token).transferFrom(msg.sender, payee, _amount));
			amount = _amount;
		}

		paymentRegistry.registerPayment(
			_contractId,
			_eventId,
			_token,
			amount
		);
	}
}
