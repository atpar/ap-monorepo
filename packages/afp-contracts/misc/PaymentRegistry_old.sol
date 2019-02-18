pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

interface IERC20 {
	function transfer(address to, uint256 value) external returns (bool);
	
	function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract PaymentRegistry {
	
	struct Payment {
		bytes32 paymentId;
		bytes32 eventId;
		address payee;
		address payer;
		address token;
		uint256 amount;
		uint256 timestamp;
	}

	// paymentId => Payment    
	mapping (bytes32 => Payment) paymentRegistry;
	
	// contract => eventId => paymentId
	mapping (address => mapping (bytes32 => bytes32[])) public paymentIdRegistry;
	
	// paymentId => Payment
	mapping (bytes32 => uint256) public liquidationRegistry;
	
	function settlePayment (
		address _contract, 
		bytes32 _eventId, 
		address _payee, 
		address _token,
		uint256 _amount
	) 
		public 
		payable
	{
		uint256 amount;
		
		if (_token == address(0)) {
			amount = msg.value;
		} else {
			require(IERC20(_token).transferFrom(msg.sender, address(this), _amount));
			amount = _amount;
		}
		
		bytes32 paymentId = keccak256(abi.encodePacked(
			_contract, 
			_eventId,
			_payee,
			_token,
			_amount
		));
		
		Payment memory payment = Payment(
			paymentId,
			_eventId,
			_payee,
			msg.sender,
			_token,
			amount, 
			block.timestamp
		);
	
		paymentRegistry[paymentId] = payment;
		paymentIdRegistry[_contract][_eventId].push(paymentId);
	}
	
	function liquidatePayment (
		bytes32 _paymentId, 
		uint256 _liquidationAmount
	)
		public
	{
		require(msg.sender == paymentRegistry[_paymentId].payee);
		
		uint256 paymentAmount = paymentRegistry[_paymentId].amount;
		uint256 liquidatedAmount = liquidationRegistry[_paymentId];
		
		require(_liquidationAmount <= paymentAmount - liquidatedAmount);
		
		liquidationRegistry[_paymentId] += _liquidationAmount;
					
		if (paymentRegistry[_paymentId].token == address(0)) {
			address(msg.sender).transfer(_liquidationAmount);
		} else {
			require(IERC20(paymentRegistry[_paymentId].token).transfer(msg.sender, _liquidationAmount));
		}
	}
	
	function getPaymentIdsForEvent (address _contract, bytes32 _eventId)
		public
		view
		returns (bytes32[] memory)
	{
		return (paymentIdRegistry[_contract][_eventId]);
	}
	
	function getPayment (bytes32 _paymentId)
		public
		view
		returns (Payment memory)
	{
		return (paymentRegistry[_paymentId]);
	}
	
	function getLiquidationAmountForPayment (bytes32 _paymentId) 
		public
		view
		returns (uint256)
	{
		return (liquidationRegistry[_paymentId]);
	}
}
