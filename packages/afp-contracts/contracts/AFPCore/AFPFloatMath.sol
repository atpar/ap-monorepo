pragma solidity ^0.5.2;


library AFPFloatMath {
	
	int256 constant private INT256_MIN = -2 ** 255;
    
  uint256 constant public PRECISION = 18;
	uint256 constant public MULTIPLICATOR = 10 ** PRECISION;

	/**
	 * @dev The product of self and _b has to be less than INT256_MAX (~10 ** 76), 
	 * as devision (normalization) is performed after multiplication
	 * Upper boundary would be (10 ** 58) * (MULTIPLICATOR) == ~10 ** 76
	 */
  function floatMult(int256 self, int256 _b)
		public
		pure
		returns(int256)
	{
		if (self == 0 || _b == 0) { return 0; }
		
		require(!(self == -1 && _b == INT256_MIN), "OVERFLOW_DETECTED");
    int256 c = self * _b;
    require(c / self == _b, "OVERFLOW_DETECTED");

		// normalize (devide by MULTIPLICATOR)
		int256 d = c / int256(MULTIPLICATOR);
		require(d != 0, "CANNOT_REPRESENT_GRANULARITY");
		
		return d;
	}
	    
	function floatDiv(int256 self, int256 _b) 
		public
		pure 
		returns(int256)
	{
		require(_b != 0, "DIVIDED_BY_ZERO");

		// normalize (multiply by MULTIPLICATOR)
		if (self == 0) { return 0; } 
		int256 c = self * int256(MULTIPLICATOR);
		require(c / self == int256(MULTIPLICATOR), "OVERFLOW_DETECTED");

    require(!(_b == -1 && self == INT256_MIN), "OVERFLOW_DETECTED");
    int256 d = c / _b;
    require(d != 0, "CANNOT_REPRESENT_GRANULARITY");

    return d;
	}
}