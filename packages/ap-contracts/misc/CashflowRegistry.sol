pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

interface IERC20 {
	function transfer(address to, uint256 value) external returns (bool);
	
	function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract CashflowRegistry {
	
	struct Cashflow {
		uint256 totalAmountPaid;
		uint256 totalAmountLiquidated;
		address payer;
		address payee;
		address token;
	}
	
	// keccak256(contract, payer, payee) => Cashflow
	mapping (bytes32 => Cashflow) public cashflowRegistry;
	
	function settlePayOff (
		address _contract, 
		address _payee, 
		address _token,
		uint256 _amount
	) 
		public 
		payable
	{
		if (_token == address(0)) {
			require(msg.value == _amount);
		} else {
			require(IERC20(_token).transferFrom(msg.sender, address(this), _amount));
		}
		
		bytes32 key = keccak256(abi.encodePacked(_contract, msg.sender, _payee));
		
		if (cashflowRegistry[key].payer == address(0)) {
			Cashflow memory cashflow = Cashflow(_amount, 0, msg.sender, _payee, _token);
			cashflowRegistry[key] = cashflow;
		} else {
			cashflowRegistry[key].totalAmountPaid += _amount;
		}
	}
	
	function liquidatePayOff (
		address _contract,
		address _payer,
		uint256 _amount
	)
		public
	{
		bytes32 key = keccak256(abi.encodePacked(_contract, _payer, msg.sender));
		
		require(msg.sender == cashflowRegistry[key].payee);
		require(_amount <= cashflowRegistry[key].totalAmountPaid - cashflowRegistry[key].totalAmountLiquidated);
		
		cashflowRegistry[key].totalAmountLiquidated += _amount;
					
		if (cashflowRegistry[key].token == address(0)) {
			address(msg.sender).transfer(_amount);
		} else {
			require(IERC20(cashflowRegistry[key].token).transfer(msg.sender, _amount));
		}
	}
	
	function getCashflow (address _contract, address _payer, address _payee)
		public
		view
		returns (Cashflow memory)
	{
		bytes32 key = keccak256(abi.encodePacked(_contract, _payer, _payee));
		return (cashflowRegistry[key]);
	}
}
