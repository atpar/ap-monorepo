pragma solidity ^0.5.2;

/**
 * TODO: implement addition and subtraction, check for overflows and underflows
 */
library AFPFloatMath_ {

	uint256 constant precision = 18;
	uint256 constant multiplicator = 10 ** precision;
	
	function getPrecision() 
		public
		pure
		returns(uint256)
	{
		return precision;
	}
	
	function getMultiplicator()
		public
		pure
		returns(uint256)
	{
		return multiplicator;
	}
    
	function floatDiv(int256 self, int256 _b) 
		public
		pure 
		returns(int256)
	{
		require(_b > 0, "floatDiv: divided by 0");

		int256 a = self * int256(multiplicator);

		if (self > 0) {
			require(a >= self, "floatDiv: integer overflow");
		} else {
			require(a <= self, "floatDiv: integer underflow");
		}

		return(a / _b);
	}

	function floatMult(int256 self, int256 _b)
		public
		pure
		returns(int256)
	{
		if (self == 0) { return 0; }

		int256 c = (self * _b) / int256(multiplicator);
		return c;
	}
}